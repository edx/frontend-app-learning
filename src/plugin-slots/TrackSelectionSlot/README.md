# Track Selection Slot

### Slot ID: `org.openedx.frontend.learning.track_selection.v1`

### Slot ID Aliases

* `track_selection_slot`

### Props

None. The default plugin reads `courseId` via `useContextId()` from the learning MFE.

## Description

Rendered on `/course/:courseId/track-selection` for RV-owned FBE track selection UI.
POST enrollment continues to use edx-platform `course_modes_choose` URL from the track selection API payload.
