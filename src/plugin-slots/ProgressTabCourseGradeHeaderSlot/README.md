# Progress Tab Course Grade Header Slot

### Slot ID: `org.openedx.frontend.learning.progress_tab_course_grade_header.v1`

### Slot ID Aliases
* `progress_tab_course_grade_header_slot`

### Props:

## Description

This slot is used to replace or modify the course grade header shown when grades are fully or partially locked.

## Example

The following `env.config.jsx` replaces the default course grade header with custom content.

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    'org.openedx.frontend.learning.progress_tab_course_grade_header.v1': {
      keepDefault: false,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_course_grade_header',
            type: DIRECT_PLUGIN,
            RenderWidget: () => (
              <div className="p-3">
                Grade details are currently limited.
              </div>
            ),
          },
        },
      ],
    },
  },
};

export default config;
```
