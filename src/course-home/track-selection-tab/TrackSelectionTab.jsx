import React from 'react';
import { useSelector } from 'react-redux';

import { useModel } from '../../generic/model-store';
import TrackSelectionSlot from '../../plugin-slots/TrackSelectionSlot';

const TrackSelectionTab = () => {
  const { courseId } = useSelector(state => state.courseHome);
  const trackSelection = useModel('trackSelection', courseId);

  if (!courseId || !trackSelection?.courseModesChooseUrl) {
    return null;
  }

  return (
    <div className="track-selection-tab w-100 mw-100 flex-grow-1 bg-white p-0">
      <TrackSelectionSlot />
    </div>
  );
};

export default TrackSelectionTab;
