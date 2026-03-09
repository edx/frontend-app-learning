# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm start                    # Start dev server (standard)
npm run dev                  # Start dev server with local OpenEdX config (host: apps.local.openedx.io)
npm run build                # Production webpack build

# Testing
npm test                     # Run all tests with coverage
npm run test:watch           # Watch mode
npm run snapshot             # Update snapshots

# Run a single test file
NODE_ENV=test npx jest path/to/file.test.jsx

# Linting
npm run lint                 # Check
npm run lint:fix             # Auto-fix

# Type checking
npm run types                # tsc --noEmit (TypeScript only)

# i18n
npm run i18n_extract         # Extract translation strings
```

## Architecture

This is an OpenEdX Micro-Frontend (MFE) built on `@edx/frontend-platform` and `@openedx/frontend-build`. It serves the learner-facing course experience.

### Routing

Routes are defined in [src/constants.ts](src/constants.ts) as `DECODE_ROUTES` and `ROUTES`. The main route structure is:
- `/course/:courseId/home` — Course outline/home tab
- `/course/:courseId/dates` — Dates tab
- `/course/:courseId/progress` — Progress tab
- `/course/:courseId/discussion/...` — Discussion tab
- `/course/:courseId/:sequenceId/:unitId` — Courseware (unit content)
- `/course/:courseId/course-end` — Course exit

All routes under `DECODE_ROUTES` are wrapped in `<DecodePageRoute>` (URL decoding support). The app entry point is [src/index.jsx](src/index.jsx).

### Redux Store Structure

The Redux store ([src/store.ts](src/store.ts)) has these slices:

| Key | Purpose |
|-----|---------|
| `models` | Normalized model store (courses, sequences, units by ID) |
| `courseware` | Current courseId, sequenceId, unit IDs and loading state |
| `courseHome` | Course home tab data |
| `specialExams` | Special exam state (external lib) |
| `learningAssistant` | AI chat assistant state (external lib) |
| `recommendations` | Course exit recommendations |
| `tours` | Product tour state |
| `plugins` | Plugin framework overrides |

**Model Store pattern**: API data is normalized and stored flat in `state.models.<type>[id]`. Slices store IDs, not full objects. Access via `state.models.courses[state.courseware.courseId]`. See [docs/decisions/0004-model-store.md](docs/decisions/0004-model-store.md).

### Key Source Directories

- [src/courseware/](src/courseware/) — Unit content delivery: sequences, units, iframes, sidebar
  - [src/courseware/data/](src/courseware/data/) — Redux slice, thunks, API, selectors for courseware
  - [src/courseware/course/sequence/](src/courseware/course/sequence/) — Sequence navigation & unit rendering
  - [src/courseware/course/new-sidebar/](src/courseware/course/new-sidebar/) — Sidebar (discussions, notifications)
- [src/course-home/](src/course-home/) — Outline, dates, progress, discussion tabs
  - Each tab has its own `data/` subdirectory with slice, thunks, and API
- [src/generic/](src/generic/) — Domain-agnostic reusable code (model-store, hooks, notices, user-messages). Do not add app-specific logic here.
- [src/shared/](src/shared/) — App-specific shared code used across multiple top-level components
- [src/plugin-slots/](src/plugin-slots/) — `@openedx/frontend-plugin-framework` plugin slots for extensibility
- [src/tab-page/](src/tab-page/) — `TabContainer` wrapper that handles tab loading state
- [src/product-tours/](src/product-tours/) — Onboarding product tours

### Naming Conventions

From [docs/decisions/0006-thunk-and-api-naming.md](docs/decisions/0006-thunk-and-api-naming.md):

- **API functions** use HTTP verb prefixes: `getCourseBlocks`, `postSequencePosition`
- **Redux thunks** use semantic prefixes: `fetchCourse`, `fetchSequence`, `saveSequencePosition`, `checkBlockCompletion`

### Data Flow Pattern

Each major feature follows this pattern:
```
data/api.js         — Raw API calls (HTTP verb naming)
data/thunks.js      — Redux thunks that call APIs and dispatch to model-store (fetch/save naming)
data/slice.js       — Redux slice (state shape + reducers)
data/selectors.js   — Reselect selectors
data/__factories__/ — Rosie factories for test data
```

### Loading State

Components own their own loading state (LOADING/LOADED/FAILED/DENIED constants from [src/constants.ts](src/constants.ts)). Components render spinners/skeletons themselves rather than relying on parents to gate rendering. See [docs/decisions/0005-components-own-their-loading-state.md](docs/decisions/0005-components-own-their-loading-state.md).

### Plugin Slots

The app exposes many plugin slots via `@openedx/frontend-plugin-framework` in [src/plugin-slots/](src/plugin-slots/). Each slot has a README. Slots allow operators to inject/replace UI components without forking.

### Testing Approach

From [docs/decisions/0007-testing.md](docs/decisions/0007-testing.md):

- Use **React Testing Library** — query by labels, text, roles; use `data-testid` as last resort
- Mock HTTP with **axios-mock-adapter**; build test data with **Rosie factories** in `data/__factories__/`
- Test non-obvious behavior (error states, interactions, corner cases) — not happy-path rendering
- **Avoid snapshots** for complex components; they're too brittle. Snapshots are acceptable for data/redux tests and tiny isolated components.