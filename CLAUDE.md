# Memory System: Developer Tools Ecosystem

This document serves as the comprehensive memory system for the NX-based developer tools ecosystem. It contains essential information, patterns, and procedures for maintaining and extending the project.

## Project Overview

### Core Concept
A scalable NX monorepo hosting multiple independent developer tools with centralized management, shared components, and automated CI/CD deployment to GitHub Pages at https://tools.dsebastien.net.

### Key Features
- **Individual Tools**: Each tool is an independent NX application
- **Shared Libraries**: Common UI components, utilities, and types
- **Automated Discovery**: Tools automatically appear in main listing
- **Strict TypeScript**: Maximum type safety and developer experience
- **CI/CD Pipeline**: GitHub Actions for testing, building, and deployment
- **GitHub Pages Hosting**: Static hosting with custom domain

## Current Architecture

### Workspace Structure
```
tools-ecosystem/
├── apps/
│   ├── tools-website/          # Main landing page (HTML/CSS/TailwindCSS)
│   ├── week-planner/           # First migrated tool (TypeScript + HTML)
│   └── [future-tools]/         # Additional tools
├── libs/
│   ├── shared-ui/              # @tools/shared-ui - Common components
│   ├── shared-utils/           # @tools/shared-utils - Utility functions
│   ├── shared-types/           # @tools/shared-types - TypeScript definitions
│   └── shared-config/          # @tools/shared-config - Build configurations
├── tools/scripts/              # Build/deploy automation
├── docs/                       # Documentation
└── .github/workflows/          # CI/CD pipelines
```

### Technology Stack
- **Framework**: NX (latest) with TypeScript (strictest config)
- **Styling**: TailwindCSS for main site, flexible per tool
- **Testing**: Jest (unit), Cypress (E2E)
- **Linting**: ESLint + Prettier + Husky pre-commit hooks
- **Deployment**: GitHub Actions → GitHub Pages
- **Domain**: tools.dsebastien.net with tool-specific paths

## Adding New Tools: Complete Guide

### Step 1: Requirements Assessment

Before creating a new tool, gather the following information:

#### Technical Requirements Checklist
- [ ] **Framework/Technology**: React, Vue, Vanilla TS, or other?
- [ ] **Dependencies**: What packages does it need?
- [ ] **Build System**: Webpack, Vite, or custom build process?
- [ ] **Browser Support**: Any specific requirements?
- [ ] **Performance Needs**: Special optimization requirements?
- [ ] **Data Storage**: LocalStorage, API calls, or purely static?

#### Functional Requirements Checklist  
- [ ] **Tool Purpose**: Clear description of what the tool does
- [ ] **URL Path**: What should `/toolname` be?
- [ ] **Subdomain**: Should `toolname.tools.dsebastien.net` work?
- [ ] **Integration**: Any shared code opportunities?
- [ ] **Testing**: Unit, integration, or E2E test needs?

### Step 2: Create NX Application

#### Standard Web Application (Recommended)
```bash
nx generate @nx/web:application [tool-name] \
  --bundler=webpack \
  --unitTestRunner=jest \
  --e2eTestRunner=cypress \
  --style=css
```

#### React Application
```bash
nx generate @nx/react:application [tool-name] \
  --style=css \
  --routing \
  --unitTestRunner=jest \
  --e2eTestRunner=cypress
```

#### Vue Application
```bash
nx generate @nx/vue:application [tool-name] \
  --style=css \
  --routing \
  --unitTestRunner=jest \
  --e2eTestRunner=cypress
```

### Step 3: Configure Application

#### Project Configuration Template (project.json)
```json
{
  "name": "tool-name",
  "type": "application",
  "root": "apps/tool-name",
  "sourceRoot": "apps/tool-name/src",
  "targets": {
    "build": {
      "executor": "@nx/webpack:webpack",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/apps/tool-name",
        "main": "apps/tool-name/src/main.ts",
        "tsConfig": "apps/tool-name/tsconfig.app.json",
        "assets": [
          "apps/tool-name/src/favicon.ico",
          "apps/tool-name/src/assets"
        ],
        "styles": ["apps/tool-name/src/styles.css"],
        "webpackConfig": "apps/tool-name/webpack.config.js"
      },
      "configurations": {
        "production": {
          "optimization": true,
          "outputHashing": "all",
          "sourceMap": false,
          "namedChunks": false,
          "extractLicenses": true,
          "vendorChunk": false,
          "budgets": [
            {
              "type": "initial",
              "maximumWarning": "500kb",
              "maximumError": "1mb"
            },
            {
              "type": "anyComponentStyle",
              "maximumWarning": "50kb",
              "maximumError": "100kb"
            }
          ]
        }
      }
    },
    "serve": {
      "executor": "@nx/webpack:dev-server",
      "options": {
        "buildTarget": "tool-name:build",
        "port": 4200
      }
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/apps/tool-name"],
      "options": {
        "jestConfig": "apps/tool-name/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/linter:eslint",
      "options": {
        "lintFilePatterns": ["apps/tool-name/**/*.{ts,tsx,js,jsx}"]
      }
    }
  }
}
```

#### TypeScript Configuration (tsconfig.app.json)
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "types": ["node"]
  },
  "files": [
    "src/main.ts"
  ],
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx"
  ],
  "exclude": [
    "**/*.spec.ts",
    "**/*.test.ts"
  ]
}
```

### Step 4: Register Tool in System

#### Add to Tools Registry
Update `apps/tools-website/src/tools-registry.ts`:

```typescript
export const toolsRegistry: ToolMetadata[] = [
  // ... existing tools
  {
    id: 'tool-name',
    name: 'Tool Display Name',
    description: 'Brief description of what this tool does (1-2 sentences)',
    url: '/tool-name',
    tags: ['productivity', 'utility'], // For filtering
    technologies: ['TypeScript', 'HTML', 'CSS'], // What it's built with
    status: 'active', // 'active' | 'beta' | 'deprecated'
    version: '1.0.0',
    lastUpdated: new Date('2024-01-01'),
    author: 'Your Name',
    category: 'productivity', // For grouping
    featured: false // Whether to highlight in main list
  }
];
```

#### Update Build Scripts
Add to `tools/scripts/build-all.js` if special build requirements exist.

### Step 5: Development Guidelines

#### Using Shared Libraries

**Import Shared UI Components**:
```typescript
import { Button, Modal, Form } from '@tools/shared-ui';
```

**Use Shared Utilities**:
```typescript
import { formatDate, debounce, validateEmail } from '@tools/shared-utils';
```

**Use Shared Types**:
```typescript
import { ToolMetadata, ApiResponse } from '@tools/shared-types';
```

#### Code Quality Standards

**TypeScript Configuration**: Always extend from root tsconfig with strict settings
**ESLint**: All code must pass linting without warnings
**Prettier**: Code must be formatted consistently
**Testing**: Minimum 70% coverage for business logic

### Step 6: Testing Implementation

#### Unit Tests Template
```typescript
// apps/tool-name/src/lib/feature.spec.ts
import { feature } from './feature';

describe('Feature', () => {
  it('should work correctly', () => {
    expect(feature()).toBeTruthy();
  });

  it('should handle edge cases', () => {
    expect(feature(null)).toBe(false);
  });
});
```

#### E2E Tests Template
```typescript
// apps/tool-name-e2e/src/e2e/app.cy.ts
describe('tool-name', () => {
  beforeEach(() => cy.visit('/'));

  it('should display tool correctly', () => {
    cy.contains('Tool Display Name');
    cy.get('[data-cy=main-feature]').should('be.visible');
  });

  it('should handle user interactions', () => {
    cy.get('[data-cy=action-button]').click();
    cy.get('[data-cy=result]').should('contain', 'expected result');
  });
});
```

### Step 7: Deployment Integration

#### GitHub Pages Structure
The deployment system automatically:
1. Builds your application to `dist/apps/tool-name`
2. Copies built files to `gh-pages` branch at `/tool-name/`
3. Updates the main tools listing page
4. Deploys to https://tools.dsebastien.net/tool-name

#### Custom Build Requirements
If your tool needs special build steps, update `.github/workflows/deploy-all.yml`:

```yaml
- name: Build [tool-name] with custom steps
  run: |
    # Custom build commands here
    npm run custom-build --app=tool-name
```

## Common Patterns and Best Practices

### Application Structure Template

```
apps/tool-name/
├── src/
│   ├── lib/                   # Core business logic
│   │   ├── components/        # Tool-specific components
│   │   ├── services/         # Data services and API calls
│   │   ├── utils/            # Tool-specific utilities
│   │   └── types/            # Tool-specific types
│   ├── assets/               # Images, fonts, static files
│   ├── styles/               # Tool-specific styles
│   ├── main.ts              # Application entry point
│   └── index.html           # HTML template
├── jest.config.ts           # Jest configuration
├── tsconfig.app.json        # TypeScript app config
├── tsconfig.spec.json       # TypeScript test config
└── project.json             # NX project configuration
```

### Shared Library Usage Guidelines

#### When to Use shared-ui
- **UI Components**: Buttons, forms, modals, alerts
- **Layout Components**: Headers, footers, navigation
- **Design System**: Colors, typography, spacing utilities
- **Icons**: Common icon sets and components

#### When to Use shared-utils
- **Date/Time**: Formatting, parsing, calculations
- **Validation**: Email, URL, form validation
- **String Utils**: Slugify, truncate, search utilities
- **Async**: Debounce, throttle, promise utilities
- **Storage**: LocalStorage, SessionStorage helpers

#### When to Use shared-types
- **API Types**: Request/response interfaces
- **Common Enums**: Status, categories, priorities
- **Configuration**: Settings, environment types
- **Tool Metadata**: Registry types, tool definitions

### Performance Best Practices

#### Bundle Optimization
- Keep individual tool bundles < 1MB
- Use dynamic imports for large dependencies
- Implement code splitting for multi-page tools
- Optimize images and assets

#### Loading Performance
- Implement lazy loading for non-critical features
- Use skeleton loading states
- Minimize initial JavaScript payload
- Optimize critical rendering path

### Security Guidelines

#### Input Validation
- Validate all user inputs client-side
- Sanitize data before localStorage
- Use TypeScript for type safety
- Implement proper error boundaries

#### Dependencies
- Keep dependencies up to date
- Regularly audit for vulnerabilities
- Avoid packages with known security issues
- Use lock files for reproducible builds

## Troubleshooting Guide

### Common Issues and Solutions

#### Build Issues

**Error: Module not found**
```bash
# Check if shared library is built
nx build shared-ui
nx build shared-utils

# Check tsconfig paths
# Verify import paths in tsconfig.base.json
```

**TypeScript errors in strict mode**
```typescript
// Common fixes:
// 1. Add explicit return types
function myFunction(): string {
  return 'value';
}

// 2. Handle null/undefined cases
if (value !== null && value !== undefined) {
  // use value
}

// 3. Use type assertions carefully
const element = document.getElementById('id') as HTMLElement;
```

**Webpack build failures**
```bash
# Clear NX cache
nx reset

# Check for circular dependencies
nx affected:graph

# Verify webpack configuration
```

#### Development Issues

**Hot reload not working**
```bash
# Check serve configuration in project.json
# Ensure port is not in use
lsof -i :4200

# Restart dev server
nx serve tool-name
```

**Tests failing**
```bash
# Update Jest snapshots
nx test tool-name --updateSnapshot

# Check test configuration
# Verify jest.config.ts extends workspace config
```

**Linting errors**
```bash
# Auto-fix linting issues
nx lint tool-name --fix

# Check .eslintrc.json configuration
# Verify extends from workspace config
```

#### Deployment Issues

**GitHub Pages deployment fails**
```bash
# Check GitHub Actions logs
# Verify all apps build successfully locally
nx run-many --target=build --all

# Check CNAME and _config.yml
# Verify domain DNS configuration
```

**Tool not appearing in main list**
```typescript
// Verify tool is added to tools-registry.ts
// Check tool metadata format
// Ensure status is 'active'
// Check for TypeScript errors in registry
```

### Debug Commands

```bash
# Check NX workspace health
nx doctor

# Analyze bundle sizes
nx build tool-name --analyze

# Run affected tests only
nx affected:test

# Check project dependencies
nx dep-graph

# Reset NX cache
nx reset
```

## Migration Guides

### Migrating Existing Tool to NX

1. **Analyze Current Structure**
   ```bash
   # Document current dependencies
   cat package.json
   
   # Note build process
   cat webpack.config.js # or similar
   
   # Identify entry points
   find . -name "*.html" -o -name "main.*"
   ```

2. **Create NX Application**
   ```bash
   nx generate @nx/web:application existing-tool-name
   ```

3. **Copy Source Files**
   ```bash
   # Copy to new structure, maintaining organization
   cp -r old-tool/src/* apps/existing-tool-name/src/
   ```

4. **Update Import Paths**
   - Change relative imports to use NX path mapping
   - Update asset references
   - Fix TypeScript configurations

5. **Adapt Build Configuration**
   - Update project.json with specific build needs
   - Configure webpack if custom configuration needed
   - Set up asset handling

6. **Test Migration**
   ```bash
   nx serve existing-tool-name
   nx build existing-tool-name
   nx test existing-tool-name
   ```

### Upgrading Dependencies

#### NX Upgrades
```bash
# Check for NX updates
nx migrate latest

# Review migration file
cat migrations.json

# Run migrations
nx migrate --run-migrations
```

#### Package Updates
```bash
# Update all packages
npm update

# Check for security issues
npm audit

# Fix security issues
npm audit fix
```

## Future Enhancements

### Planned Features
- **Analytics Integration**: Usage tracking and metrics
- **Tool Versioning**: Support for multiple tool versions
- **User Feedback**: Rating and comment system
- **Tool Categories**: Better organization and discovery
- **API Documentation**: Auto-generated API docs for tools
- **Performance Monitoring**: Real-time performance tracking
- **PWA Features**: Offline support and app-like experience

### Infrastructure Improvements
- **CDN Integration**: Faster global content delivery
- **Advanced Caching**: More aggressive caching strategies
- **Build Optimization**: Parallel builds and better caching
- **Testing Enhancement**: Visual regression testing
- **Security Hardening**: Enhanced security scanning

### Developer Experience
- **Tool Templates**: Pre-configured tool templates
- **CLI Tools**: Custom CLI for common operations
- **Documentation**: Auto-generated documentation
- **Development Tools**: Better debugging and profiling

## Configuration Reference

### Environment Variables
```bash
# Development
NODE_ENV=development
NX_DAEMON=true

# Production
NODE_ENV=production
NX_CLOUD_DISTRIBUTED_EXECUTION=false
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "nx serve tools-website",
    "build": "nx run-many --target=build --all",
    "test": "nx run-many --target=test --all", 
    "lint": "nx run-many --target=lint --all",
    "e2e": "nx run-many --target=e2e --all",
    "affected:build": "nx affected:build",
    "affected:test": "nx affected:test"
  }
}
```

### Key Configuration Files
- `nx.json` - NX workspace configuration
- `tsconfig.base.json` - Root TypeScript configuration
- `jest.preset.js` - Jest workspace configuration
- `.eslintrc.json` - ESLint workspace rules
- `.prettierrc` - Code formatting rules
- `tailwind.config.js` - TailwindCSS configuration

## Contact and Support

### Getting Help
- **Documentation**: Check this CLAUDE.md file first
- **Issues**: Create GitHub issue with detailed description
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: Follow PR template and guidelines

### Contributing Guidelines
- **Code Style**: Follow existing patterns and conventions
- **Testing**: Include appropriate tests with changes
- **Documentation**: Update CLAUDE.md with new patterns
- **Performance**: Consider bundle size and loading impact

This memory system should be updated as new tools are added and patterns emerge. It serves as the single source of truth for development practices and procedures in this ecosystem.