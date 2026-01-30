# Release Process

This document describes how to create releases for the tools-website project.

## Overview

The release process has been updated to ensure that `package.json` and `bun.lock` versions are correctly updated **before** creating tags, and that the changelog is generated automatically.

## Two Ways to Create a Release

### 1. Local Release (Recommended)

Use the `bun run release` command to create a release from your local machine:

```bash
bun run release
```

This script will:

1. Check that your git working directory is clean
2. Warn if you're not on the `main` branch
3. Prompt you for a tag name (e.g., `1.0.0` or `v1.0.0`)
4. Update `package.json` with the new version
5. Update `bun.lock` by running `bun install`
6. Generate/update `CHANGELOG.md` from conventional commits
7. Show you a diff of the changes
8. Ask for confirmation before committing
9. Create a commit with message `chore(release): <tag>`
10. Create a git tag pointing to that commit
11. Push both the commit and tag to GitHub
12. Trigger automatic deployment to GitHub Pages

**Example:**

```bash
$ bun run release
Enter tag name (e.g., 1.0.0 or v1.0.0): 2.8.0
Creating release: 2.8.0
Updating package.json version...
Updated package.json version to 2.8.0
Updating bun.lock...
Generating changelog...
Changes to be committed:
[... diff output ...]
Commit these changes? (Y/n) y
Committing release changes...
Creating tag 2.8.0...
Pushing commit and tag to origin...
✓ Release 2.8.0 created and pushed successfully!
  - Commit: abc123def456
  - Tag: 2.8.0
  - Deployment will start automatically
```

### 2. GitHub Workflow Dispatch

You can also create releases through the GitHub Actions UI:

1. Go to **Actions** → **Create Release** workflow
2. Click **Run workflow**
3. Enter the tag name (e.g., `2.8.0`)
4. Click **Run workflow**

This will:

1. Update `package.json` and `bun.lock`
2. Generate changelog
3. Commit changes to main
4. Create and push the tag
5. Create a GitHub Release with changelog notes

## Version Format

The release scripts accept versions in two formats:

- Semantic version: `1.2.3`
- With 'v' prefix: `v1.2.3`

The 'v' prefix is automatically stripped and the version is stored as `1.2.3` in `package.json`.

## Changelog Generation

The changelog is automatically generated from git commit messages using [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog).

**Important:** Use conventional commit messages for proper changelog generation:

- `feat: add new feature` → Features section
- `fix: resolve bug` → Bug Fixes section
- `docs: update documentation` → Documentation section
- `chore: update dependencies` → Chore section
- `refactor: restructure code` → Refactoring section
- `test: add tests` → Tests section
- `style: formatting changes` → Styling section
- `perf: performance improvements` → Performance section

Breaking changes can be indicated with `BREAKING CHANGE:` in the commit footer.

## What Gets Updated

When you run a release, these files are modified and committed:

1. **package.json** - `version` field updated
2. **bun.lock** - Lock file updated
3. **CHANGELOG.md** - New version entry added at the top

The git tag is created on the commit that includes these changes, ensuring the tag always points to the correct version.

## Troubleshooting

### "Git working directory is not clean"

You have uncommitted changes. Commit or stash them before creating a release:

```bash
git status
git add .
git commit -m "commit message"
# or
git stash
```

### "Tag already exists"

The tag you're trying to create already exists. Choose a different version number:

```bash
git tag -l  # List all tags
```

### Version not updated in bun.lock

This should not happen with the new release process, but if it does:

```bash
bun install
```

### Release workflow updates version after tag

If you pushed a tag manually (not using `bun run release`), the workflow may try to update the version again. **Always use `bun run release`** for local releases to avoid this issue.

## Migration Notes

### Old Release Process (Before Fix)

The old `bun run release` command simply created and pushed a tag without updating versions:

```bash
# OLD - Don't use this anymore
read -p 'Enter tag name: ' TAG && git tag "$TAG" && git push origin "$TAG"
```

This caused issues because:

- `package.json` and `bun.lock` were not updated
- The tag pointed to a commit with the old version
- The workflow tried to update versions after the tag, creating confusion

### New Release Process (After Fix)

The new process ensures everything is updated before tagging:

```bash
# NEW - Correct process
bun run release
```

This runs the `scripts/release.sh` script which handles all version updates before creating the tag.

## GitHub Workflows

### Deploy Workflow (`.github/workflows/deploy.yml`)

- **Trigger:** Any tag push
- **Purpose:** Build and deploy to GitHub Pages
- **Does NOT** update versions (versions are already updated)

### Release Workflow (`.github/workflows/release.yml`)

- **Trigger 1:** Tag push (from local release)
- **Trigger 2:** Manual workflow_dispatch
- **Purpose:** Create GitHub Release with changelog notes
- **Behavior:**
    - On tag push: Just creates GitHub Release (versions already updated)
    - On workflow_dispatch: Updates versions, commits, tags, then creates release

## Best Practices

1. **Always commit your changes** before running `bun run release`
2. **Use semantic versioning** (MAJOR.MINOR.PATCH)
3. **Use conventional commits** for automatic changelog generation
4. **Review the diff** before confirming the release commit
5. **Test locally** before releasing (`bun run build`)
6. **Don't manually edit** `bun.lock` - let bun update it

## Related Scripts

- `bun run release:update-version <version>` - Update package.json only
- `bun run release:changelog` - Generate/update CHANGELOG.md only
- `bun run release` - Full release process (recommended)
