import React from 'react';
import { useParams } from 'react-router-dom';

import { PluginSlot } from '@openedx/frontend-plugin-framework';

const TrackSelectionSlot = () => {
  const { courseId } = useParams();

  return (
    <PluginSlot
      id="org.openedx.frontend.learning.track_selection.v1"
      idAliases={['track_selection_slot']}
      pluginProps={{ courseId }}
    />
  );
};

export default TrackSelectionSlot;
