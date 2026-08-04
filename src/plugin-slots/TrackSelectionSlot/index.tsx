import React from 'react';

import { PluginSlot } from '@openedx/frontend-plugin-framework';

export const TrackSelectionSlot = () => (
  <PluginSlot
    id="org.openedx.frontend.learning.track_selection.v1"
    idAliases={['track_selection_slot']}
  />
);

export default TrackSelectionSlot;
