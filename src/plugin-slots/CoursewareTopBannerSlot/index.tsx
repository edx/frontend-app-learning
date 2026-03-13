import React from 'react';

import { PluginSlot } from '@openedx/frontend-plugin-framework';

interface CoursewareTopBannerSlotProps {
  courseId: string;
}

export const CoursewareTopBannerSlot = ({
  courseId,
}: CoursewareTopBannerSlotProps) => (
  <PluginSlot
    id="org.openedx.frontend.learning.courseware_top_banner.v1"
    idAliases={['courseware_top_banner_slot']}
    pluginProps={{
      courseId,
      model: 'coursewareMeta',
    }}
  />
);

export default CoursewareTopBannerSlot;
