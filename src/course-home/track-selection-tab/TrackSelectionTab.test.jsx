import React from 'react';
import { AppProvider } from '@edx/frontend-platform/react';

import { initializeMockApp, render, screen } from '../../setupTest';
import { useModel } from '../../generic/model-store';
import { fetchTabSuccess } from '../data/slice';
import initializeStore from '../../store';
import TrackSelectionTab from './TrackSelectionTab';

jest.mock('../../generic/model-store', () => ({
  ...jest.requireActual('../../generic/model-store'),
  useModel: jest.fn(),
}));
jest.mock('../../plugin-slots/TrackSelectionSlot', () => function MockTrackSelectionSlot() {
  return <div data-testid="track-selection-slot" />;
});

describe('TrackSelectionTab', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';

  beforeAll(() => {
    initializeMockApp();
  });

  beforeEach(() => {
    useModel.mockImplementation((modelType, id) => {
      if (modelType === 'trackSelection' && id === courseId) {
        return { courseModesChooseUrl: '/course_modes/choose/demo/' };
      }
      return {};
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function renderComponent() {
    const store = initializeStore();
    store.dispatch(fetchTabSuccess({ courseId }));
    return render(
      <AppProvider store={store}>
        <TrackSelectionTab />
      </AppProvider>,
    );
  }

  it('renders the plugin slot when track selection data is available', () => {
    renderComponent();

    expect(screen.getByTestId('track-selection-slot')).toBeInTheDocument();
    expect(document.querySelector('.track-selection-tab')).toBeInTheDocument();
  });

  it('renders nothing when courseModesChooseUrl is missing', () => {
    useModel.mockImplementation(() => ({}));
    renderComponent();

    expect(screen.queryByTestId('track-selection-slot')).not.toBeInTheDocument();
  });

  it('renders nothing when courseId is missing', () => {
    const store = initializeStore();
    render(
      <AppProvider store={store}>
        <TrackSelectionTab />
      </AppProvider>,
    );

    expect(screen.queryByTestId('track-selection-slot')).not.toBeInTheDocument();
  });
});
