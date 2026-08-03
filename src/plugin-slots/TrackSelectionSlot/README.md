# Track Selection Slot

### Slot ID: `org.openedx.frontend.learning.track_selection.v1`

### Slot ID Aliases
* `track_selection_slot`

### Props:

None. The injected plugin reads `courseId` from the route.

## Description

This slot renders the FBE track selection page at `/course/:courseId/track-selection`. Operators inject a plugin to provide audit/verified enrollment UI; the core app does not ship a default implementation.

## Example

The following `env.config.jsx` registers the track selection plugin for this route.

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';
import { TrackSelectionPage } from '@edx/track-selection-plugin';

const config = {
  pluginSlots: {
    track_selection_slot: {
      keepDefault: false,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'track_selection_page',
            type: DIRECT_PLUGIN,
            RenderWidget: TrackSelectionPage,
          },
        },
      ],
    },
  },
};

export default config;
```
