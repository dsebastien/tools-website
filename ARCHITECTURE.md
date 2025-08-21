# Architecture Documentation: Developer Tools Ecosystem

## Overview

This document outlines the architectural design of the NX-based developer tools ecosystem, covering workspace structure, application patterns, shared libraries, and deployment strategies.

## NX Workspace Structure

```
tools-ecosystem/
├── apps/
│   ├── tools-website/          # Main landing page (HTML/CSS/TailwindCSS)
│   ├── week-planner/           # Migrated existing tool (TypeScript + static HTML)
│   └── [future-tools]/         # Additional tools as needed
├── libs/
│   ├── shared-ui/              # Common UI components
│   │   ├── components/         # Reusable UI components
│   │   ├── styles/            # TailwindCSS utilities and themes
│   │   └── index.ts           # Public API exports
│   ├── shared-utils/           # Common utilities
│   │   ├── date/              # Date manipulation functions
│   │   ├── string/            # String utilities
│   │   ├── validation/        # Input validation
│   │   └── index.ts           # Public API exports
│   ├── shared-types/           # TypeScript definitions
│   │   ├── api/               # API response types
│   │   ├── common/            # Common interfaces
│   │   └── index.ts           # Type exports
│   └── shared-config/          # Shared configurations
│       ├── build/             # Build configuration utilities
│       ├── env/               # Environment variable handling
│       └── index.ts           # Configuration exports
├── tools/
│   ├── scripts/               # Build/deploy automation scripts
│   │   ├── build-all.js       # Collective build script
│   │   ├── deploy-tool.js     # Individual tool deployment
│   │   └── tool-registry.js   # Tool registration automation
│   └── config/                # Shared configurations
│       ├── jest.config.js     # Jest base configuration
│       ├── webpack.config.js  # Webpack shared configuration
│       └── tailwind.config.js # TailwindCSS base configuration
├── docs/                      # Documentation & memory
│   ├── guides/                # Developer guides
│   ├── api/                   # API documentation
│   └── troubleshooting/       # Common issues and solutions
├── .github/
│   └── workflows/             # CI/CD pipeline definitions
├── workspace.json             # NX workspace configuration
├── nx.json                    # NX configuration
├── package.json               # Root dependencies
└── CLAUDE.md                  # Memory for future development
```

## Application Architecture Patterns

### 1. NX Application Configuration Template

Each application follows this standardized configuration pattern:

```json
{
  "name": "app-name",
  "type": "application",
  "root": "apps/app-name",
  "sourceRoot": "apps/app-name/src",
  "targets": {
    "build": {
      "executor": "@nx/webpack:webpack",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/apps/app-name",
        "main": "apps/app-name/src/main.ts",
        "polyfills": "apps/app-name/src/polyfills.ts",
        "tsConfig": "apps/app-name/tsconfig.app.json",
        "assets": [
          "apps/app-name/src/favicon.ico",
          "apps/app-name/src/assets"
        ],
        "styles": ["apps/app-name/src/styles.css"],
        "scripts": []
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
            }
          ]
        },
        "development": {
          "optimization": false,
          "sourceMap": true,
          "namedChunks": true,
          "vendorChunk": true
        }
      }
    },
    "serve": {
      "executor": "@nx/webpack:dev-server",
      "options": {
        "buildTarget": "app-name:build",
        "port": 4200
      },
      "configurations": {
        "production": {
          "buildTarget": "app-name:build:production"
        }
      }
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/apps/app-name"],
      "options": {
        "jestConfig": "apps/app-name/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/linter:eslint",
      "options": {
        "lintFilePatterns": ["apps/app-name/**/*.{ts,tsx,js,jsx}"]
      }
    },
    "e2e": {
      "executor": "@nx/cypress:cypress",
      "options": {
        "cypressConfig": "apps/app-name-e2e/cypress.config.ts",
        "testingType": "e2e",
        "devServerTarget": "app-name:serve"
      }
    }
  }
}
```

### 2. Library Configuration Template

Shared libraries follow this configuration pattern:

```json
{
  "name": "shared-library-name",
  "type": "library",
  "root": "libs/shared-library-name",
  "sourceRoot": "libs/shared-library-name/src",
  "targets": {
    "build": {
      "executor": "@nx/js:tsc",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/libs/shared-library-name",
        "main": "libs/shared-library-name/src/index.ts",
        "tsConfig": "libs/shared-library-name/tsconfig.lib.json",
        "assets": []
      }
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/libs/shared-library-name"],
      "options": {
        "jestConfig": "libs/shared-library-name/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/linter:eslint",
      "options": {
        "lintFilePatterns": ["libs/shared-library-name/**/*.ts"]
      }
    }
  }
}
```

## TypeScript Configuration Architecture

### Root Configuration Hierarchy

#### 1. Root tsconfig.json (Strictest Possible)
```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "rootDir": ".",
    "sourceMap": true,
    "declaration": false,
    "moduleResolution": "node",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "importHelpers": true,
    "target": "es2022",
    "module": "esnext",
    "lib": ["es2022", "dom"],
    "skipLibCheck": true,
    "skipDefaultLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@tools/shared-ui": ["libs/shared-ui/src/index.ts"],
      "@tools/shared-utils": ["libs/shared-utils/src/index.ts"],
      "@tools/shared-types": ["libs/shared-types/src/index.ts"],
      "@tools/shared-config": ["libs/shared-config/src/index.ts"]
    },
    // Strictest possible TypeScript configuration
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "noPropertyAccessFromIndexSignature": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,
    "forceConsistentCasingInFileNames": true
  },
  "exclude": ["node_modules", "tmp"]
}
```

#### 2. Application tsconfig.app.json Template
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "types": ["node"]
  },
  "files": ["src/main.ts", "src/polyfills.ts"],
  "include": ["src/**/*.ts"],
  "exclude": ["**/*.spec.ts", "**/*.test.ts"]
}
```

#### 3. Library tsconfig.lib.json Template
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "declaration": true,
    "types": []
  },
  "include": ["src/**/*.ts"],
  "exclude": ["**/*.spec.ts", "**/*.test.ts"]
}
```

## Shared Libraries Architecture

### 1. shared-ui Library Structure
```
libs/shared-ui/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── Button/
│   │   │   │   ├── Button.ts
│   │   │   │   ├── Button.spec.ts
│   │   │   │   └── index.ts
│   │   │   ├── Modal/
│   │   │   ├── Form/
│   │   │   └── index.ts
│   │   ├── styles/
│   │   │   ├── base.css
│   │   │   ├── components.css
│   │   │   └── utilities.css
│   │   └── index.ts
│   └── index.ts
├── jest.config.ts
├── tsconfig.lib.json
├── tsconfig.spec.json
└── project.json
```

### 2. shared-utils Library Structure
```
libs/shared-utils/
├── src/
│   ├── lib/
│   │   ├── date/
│   │   │   ├── formatters.ts
│   │   │   ├── parsers.ts
│   │   │   ├── validators.ts
│   │   │   └── index.ts
│   │   ├── string/
│   │   │   ├── manipulations.ts
│   │   │   ├── validators.ts
│   │   │   └── index.ts
│   │   ├── validation/
│   │   │   ├── schemas.ts
│   │   │   ├── validators.ts
│   │   │   └── index.ts
│   │   ├── async/
│   │   │   ├── debounce.ts
│   │   │   ├── throttle.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   └── index.ts
└── [config files]
```

### 3. shared-types Library Structure
```
libs/shared-types/
├── src/
│   ├── lib/
│   │   ├── api/
│   │   │   ├── responses.ts
│   │   │   ├── requests.ts
│   │   │   └── index.ts
│   │   ├── common/
│   │   │   ├── interfaces.ts
│   │   │   ├── enums.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── tools/
│   │   │   ├── registry.ts
│   │   │   ├── metadata.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   └── index.ts
└── [config files]
```

## Build System Architecture

### 1. NX Configuration (nx.json)
```json
{
  "extends": "nx/presets/npm.json",
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"],
      "cache": true
    },
    "test": {
      "inputs": ["default", "^production", "{workspaceRoot}/jest.preset.js"],
      "cache": true
    },
    "lint": {
      "inputs": [
        "default",
        "{workspaceRoot}/.eslintrc.json",
        "{workspaceRoot}/.eslintignore"
      ],
      "cache": true
    },
    "e2e": {
      "cache": true
    }
  },
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": [
      "default",
      "!{projectRoot}/**/?(*.)+(spec|test).[jt]s?(x)?(.snap)",
      "!{projectRoot}/tsconfig.spec.json",
      "!{projectRoot}/jest.config.[jt]s",
      "!{projectRoot}/.eslintrc.json"
    ],
    "sharedGlobals": []
  },
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx/tasks-runners/default",
      "options": {
        "cacheableOperations": ["build", "test", "lint", "e2e"]
      }
    }
  },
  "affected": {
    "defaultBase": "main"
  },
  "cli": {
    "packageManager": "npm"
  },
  "generators": {
    "@nx/web:application": {
      "bundler": "webpack",
      "unitTestRunner": "jest",
      "e2eTestRunner": "cypress"
    },
    "@nx/js:library": {
      "bundler": "tsc",
      "unitTestRunner": "jest"
    }
  }
}
```

### 2. Build Optimization Strategy

#### Caching Strategy
- **Local caching**: NX local cache for build artifacts
- **Remote caching**: GitHub Actions cache for CI/CD
- **Dependency caching**: Node modules cached across runs
- **Incremental builds**: Only build affected projects

#### Bundle Optimization
- **Tree shaking**: Remove unused code from bundles
- **Code splitting**: Separate vendor and application code
- **Asset optimization**: Compress images and fonts
- **Bundle analysis**: Regular bundle size monitoring

## Deployment Architecture

### GitHub Pages Deployment Structure

```
gh-pages branch:
├── index.html                 # Main tools listing page
├── assets/
│   ├── css/
│   │   ├── main.css          # Main site TailwindCSS
│   │   └── shared.css        # Shared component styles
│   ├── js/
│   │   ├── main.js           # Main site JavaScript
│   │   └── search.js         # Search functionality
│   └── images/
│       ├── favicon.ico
│       └── tool-icons/
├── week-planner/             # Week planner tool
│   ├── index.html
│   ├── assets/
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   └── [tool-specific files]
├── [future-tool]/            # Each new tool gets its own directory
│   ├── index.html
│   ├── assets/
│   └── [tool-specific files]
├── shared/                   # Shared assets across tools
│   ├── ui-components/
│   ├── utilities/
│   └── styles/
├── api/                      # Static JSON files for tool metadata
│   ├── tools-registry.json
│   └── tool-metadata.json
├── _config.yml               # Jekyll configuration
├── CNAME                     # Domain configuration
├── 404.html                  # Custom 404 page with tool suggestions
└── robots.txt                # SEO configuration
```

### URL Routing Strategy

#### Primary Domain Routing
- `tools.dsebastien.net` → Main tools listing page
- `tools.dsebastien.net/week-planner` → Week planner tool
- `tools.dsebastien.net/[tool-name]` → Individual tool pages

#### Subdomain Routing (Future Enhancement)
- `week-planner.tools.dsebastien.net` → Direct tool access
- `[tool-name].tools.dsebastien.net` → Direct tool access

#### Jekyll Configuration for Routing
```yaml
# _config.yml
plugins:
  - jekyll-redirect-from
  - jekyll-sitemap

collections:
  tools:
    output: true
    permalink: /:name/

defaults:
  - scope:
      path: ""
      type: "tools"
    values:
      layout: "tool"

# Custom redirects
redirect_from:
  - /weekplanner
  - /week_planner
  - /planner
```

## Security Architecture

### Build Security
- **Dependency scanning**: Automated vulnerability checks
- **Secrets management**: No secrets in build artifacts
- **Supply chain security**: Lock file integrity checks
- **Content Security Policy**: Strict CSP headers

### Runtime Security
- **HTTPS enforcement**: All traffic over HTTPS
- **Subresource integrity**: Verify external resources
- **Input validation**: Client-side input sanitization
- **XSS protection**: Content sanitization for user inputs

## Performance Architecture

### Loading Strategy
- **Critical path optimization**: Inline critical CSS
- **Lazy loading**: Non-critical resources loaded on demand
- **Resource hints**: Preload, prefetch, and preconnect
- **Service worker**: Caching strategy for offline support

### Monitoring and Analytics
- **Core Web Vitals**: LCP, FID, CLS monitoring
- **Bundle size tracking**: Automated bundle analysis
- **Performance budgets**: CI/CD performance gates
- **User experience metrics**: Real user monitoring

## Testing Architecture

### Unit Testing Strategy
- **Framework**: Jest with TypeScript support
- **Coverage targets**: 80% minimum for shared libraries
- **Mocking strategy**: Mock external dependencies
- **Test organization**: Co-located with source files

### Integration Testing
- **Framework**: Cypress for E2E testing
- **Test environments**: Local and CI environments
- **Data management**: Test fixtures and mocks
- **Visual regression**: Screenshot comparison tests

### Quality Assurance
- **Linting**: ESLint with TypeScript rules
- **Type checking**: Strict TypeScript compilation
- **Code formatting**: Prettier with pre-commit hooks
- **Accessibility**: Automated a11y testing

This architecture provides a scalable, maintainable foundation for the developer tools ecosystem while ensuring type safety, performance, and developer experience.