import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  discussionsTitle: {
    id: 'discussions.sidebar.title',
    defaultMessage: 'Discussions',
    description: 'Title text for a forum where users are able to discuss course topics',
  },
  rightSidebarTray: {
    id: 'right.sidebar.tray.container',
    defaultMessage: 'Right sidebar tray',
    description: 'Right sidebar tray container for discussions, upsell, and other panels',
  },
  /** @deprecated Use rightSidebarTray instead */
  discussionNotificationTray: {
    id: 'discussions.notification.tray.container', // ← keep original ID
    defaultMessage: 'Right sidebar tray',
    description: 'Right sidebar tray container for discussions, upsell, and other panels',
  },
  upsellTitle: {
    id: 'upsell.tray.title',
    defaultMessage: 'Upgrade',
    description: 'Title text displayed for the upgrade/upsell tray',
  },
  closeTrigger: {
    id: 'tray.close.button',
    defaultMessage: 'Close tray',
    description: 'Button for the learner to close the sidebar',
  },
  openSidebarTrigger: {
    id: 'sidebar.open.button',
    defaultMessage: 'Show sidebar tray',
    description: 'Button to open the sidebar tray and shows notifications and discussions',
  },
  responsiveCloseSidebarTray: {
    id: 'responsive.close.sidebar',
    defaultMessage: 'Back to course',
    description: 'Responsive button to go back to course and close the sidebar tray',
  },
});

export default messages;
