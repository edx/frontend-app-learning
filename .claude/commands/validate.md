Run all pre-PR validation checks and report results.

> Note: The build step uses `npm run build:validate` (with a stub `env.config`) rather than `npm run build`, so the build succeeds without the private edX plugin packages required in production. All other checks match CI.

Execute the following checks **in order**, capturing output from each. Continue through all checks even if one fails — collect all failures before reporting.

## Checks to run

### 1. Commit messages
Run: `git log release-teak..HEAD --format="%H %s"`

> Note: `release-teak` is the current base branch for PRs in the `edx` fork. Update this (and the matching allow-list entry in `.claude/settings.json`) when the default branch changes.

For each commit, validate the subject line against the conventional commits format:
`<type>(<optional scope>): <description>`

Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

Flag any commit whose subject does not match this pattern.

### 2. Lint
Run: `npm run lint -- --max-warnings 0`

### 3. Type checking
Run: `npm run types`

### 4. Tests
Run: `npm test -- --passWithNoTests`

### 5. Build
Run: `npm run build:validate`

### 6. Bundle size
Run: `npm run bundlewatch`

## Report

After all checks complete, output a summary table:

| Check | Status |
|-------|--------|
| Commit messages | ✅ PASS / ❌ FAIL |
| Lint | ✅ PASS / ❌ FAIL |
| Types | ✅ PASS / ❌ FAIL |
| Tests | ✅ PASS / ❌ FAIL |
| Build | ✅ PASS / ❌ FAIL |
| Bundle size | ✅ PASS / ❌ FAIL |

For each failed check, show the specific errors and a brief suggested fix.
If all checks pass, confirm the branch is ready for a PR.
