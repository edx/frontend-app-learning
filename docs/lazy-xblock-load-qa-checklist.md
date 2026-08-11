# Manual QA checklist — Phase B2 Learning MFE lazy xblock load

## Prerequisites

- edx-platform B1 deployed (shell `render_mode` + `/api/courseware/v1/xblock_children/`)
- Waffle: `courseware.render_xblock.lazy_library_content` ON for pilot course
- MFE: `ENABLE_LAZY_XBLOCK_LOAD=true` (maps from `learning_mfe.enable_lazy_xblock_load`)
- Course unit with library_content / item_bank and max_count > LARGE_VERTICAL_PROBLEM_THRESHOLD (20)

## Happy path (IBM-scale vertical)

- [ ] Open Learning MFE unit iframe for the large quiz
- [ ] Network: iframe URL includes `render_mode=shell`
- [ ] Shell HTML loads quickly (no nginx 504); placeholders visible
- [ ] Console/network: `xblock.lazy.ready` observed (postMessage)
- [ ] Network: one or more `GET /api/courseware/v1/xblock_children/` calls (≤10 keys, ≤3 parallel)
- [ ] Progress text updates (“Loading question N of M…”)
- [ ] Problems appear progressively; iframe height grows after each batch
- [ ] Learner can answer and submit a loaded CAPA problem
- [ ] No generic “iframe failed to load” error overlay

## Flag-off / small unit regressions

- [ ] With `ENABLE_LAZY_XBLOCK_LOAD` false → iframe URL has no `render_mode=shell`; full render
- [ ] Small vertical (below threshold) with flag on → LMS serves full HTML (shell ignored)
- [ ] Honor code / exam gated units still block content as before

## Error cases

- [ ] Force batch API 500 → warning banner; page remains usable for already-loaded children
- [ ] Request unselected child key → 403/forbidden in errors list; other children still load
