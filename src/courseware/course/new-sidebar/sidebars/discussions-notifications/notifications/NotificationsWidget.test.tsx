/* eslint-disable react/jsx-no-constructed-context-values */
import React from 'react';

import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { breakpoints } from '@openedx/paragon';

import {
  initializeMockApp, render, screen, act, fireEvent, waitFor,
} from '../../../../../../setupTest';
import initializeStore from '../../../../../../store';
import { appendBrowserTimezoneToUrl, executeThunk } from '../../../../../../utils';
import { fetchCourse } from '../../../../../data';
import SidebarContext, { SidebarContextData } from '../../../SidebarContext';
import NotificationsWidget from './NotificationsWidget';
import setupDiscussionSidebar from '../../../../test-utils';

initializeMockApp();
jest.mock('@edx/frontend-platform/analytics');

describe('NotificationsWidget', () => {
  let axiosMock;
  let store;
  // CHANGED: Use 'UPSELL' — the new sidebar ID for the upsell/notifications panel
  const ID = 'UPSELL';
  const defaultMetadata = Factory.build('courseMetadata');
  const courseId = defaultMetadata.id;
  let courseMetadataUrl = `${getConfig().LMS_BASE_URL}/api/courseware/course/${defaultMetadata.id}`;
  courseMetadataUrl = appendBrowserTimezoneToUrl(courseMetadataUrl);

  const courseHomeMetadata = Factory.build('courseHomeMetadata');
  const courseHomeMetadataUrl = appendBrowserTimezoneToUrl(`${getConfig().LMS_BASE_URL}/api/course_home/course_metadata/${courseId}`);

  function setMetadata(attributes, options = undefined) {
    const updatedCourseHomeMetadata = Factory.build('courseHomeMetadata', attributes, options);
    axiosMock.onGet(courseHomeMetadataUrl).reply(200, updatedCourseHomeMetadata);
  }

  async function fetchAndRender(component) {
    await executeThunk(fetchCourse(defaultMetadata.id), store.dispatch);
    render(component, { store });
  }

  // ADDED: Helper to build a partial SidebarContextData safely
  // Uses `as unknown as SidebarContextData` to satisfy TS when only providing test-relevant fields
  function buildTestContext(overrides: Partial<SidebarContextData>): SidebarContextData {
    return {
      toggleSidebar: jest.fn(),
      onNotificationSeen: jest.fn(),
      setNotificationStatus: jest.fn(),
      currentSidebar: null,
      notificationStatus: 'inactive',
      upgradeNotificationCurrentState: 'accessDateView',
      setUpgradeNotificationCurrentState: jest.fn(),
      shouldDisplaySidebarOpen: true,
      shouldDisplayFullScreen: false,
      courseId,
      unitId: 'unit-1',
      enabledPanels: ['DISCUSSIONS', 'UPSELL'],
      isDiscussionbarAvailable: false,
      hideDiscussionbar: true,
      hideNotificationbar: false,
      isNotificationbarAvailable: true,
      ...overrides,
    } as SidebarContextData;
  }

  beforeEach(async () => {
    global.innerWidth = breakpoints.large.minWidth;
    store = initializeStore();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(courseMetadataUrl).reply(200, defaultMetadata);
    axiosMock.onGet(courseHomeMetadataUrl).reply(200, courseHomeMetadata);
  });

  it('successfully Open/Hide sidebar tray', async () => {
    const userVerifiedMode = Factory.build('verifiedMode');
    await setupDiscussionSidebar({ verifiedMode: userVerifiedMode, isNewDiscussionSidebarViewEnabled: true });

    const sidebarButton = await screen.getByRole('button', { name: /Show sidebar tray/i });

    await act(async () => {
      fireEvent.click(sidebarButton);
    });

    await waitFor(async () => {
      // CHANGED: Updated test IDs to match new sidebar IDs
      expect(screen.queryByTestId('sidebar-DISCUSSIONS')).toBeInTheDocument();
      expect(screen.queryByTitle('Discussions')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(sidebarButton);
    });

    await waitFor(async () => {
      expect(screen.queryByTestId('sidebar-DISCUSSIONS')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Discussions')).not.toBeInTheDocument();
    });
  });

  it('includes notification_widget_slot', async () => {
    // CHANGED: Use buildTestContext helper instead of raw cast
    await fetchAndRender(
      <SidebarContext.Provider value={buildTestContext({
        currentSidebar: ID,
        courseId,
        hideNotificationbar: false,
        isNotificationbarAvailable: true,
      })}
      >
        <NotificationsWidget />
      </SidebarContext.Provider>,
    );
    expect(screen.getByTestId('org.openedx.frontend.learning.notification_widget.v1')).toBeInTheDocument();
  });

  it('renders no notifications bar if no verified mode', async () => {
    setMetadata({ verified_mode: null });
    // CHANGED: Use buildTestContext helper
    await fetchAndRender(
      <SidebarContext.Provider value={buildTestContext({
        currentSidebar: ID,
        courseId,
        hideNotificationbar: true,
        isNotificationbarAvailable: false,
      })}
      >
        <NotificationsWidget />
      </SidebarContext.Provider>,
    );
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
  });

  it('marks notification as seen 3 seconds later', async () => {
    const onNotificationSeen = jest.fn();
    // CHANGED: Use buildTestContext helper
    await fetchAndRender(
      <SidebarContext.Provider value={buildTestContext({
        currentSidebar: ID,
        courseId,
        onNotificationSeen,
        hideNotificationbar: false,
        isNotificationbarAvailable: true,
      })}
      >
        <NotificationsWidget />
      </SidebarContext.Provider>,
    );
    expect(onNotificationSeen).toHaveBeenCalledTimes(0);
    await waitFor(() => expect(onNotificationSeen).toHaveBeenCalledTimes(1), { timeout: 3500 });
  });
});
