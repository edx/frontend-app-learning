import React from 'react';

import { PluginSlot } from '@openedx/frontend-plugin-framework';

export const BannerDatesUpgradeSlot = ({
  courseId,
}: BannerDatesUpgradeSlotProps) => (
  <PluginSlot
    id="org.openedx.frontend.learning.banner_dates_upgrade.v1"
    idAliases={['dates_upgrade_banner_slot']}
    pluginProps={{
      courseId,
    }}
  />
);

interface BannerDatesUpgradeSlotProps {
  courseId: string;
}
