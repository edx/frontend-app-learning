import React, { useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import SidebarBase from '../../common/SidebarBase';
import messages from '../../messages';
import SidebarContext from '../../SidebarContext';
import NotificationsWidget from '../discussions-notifications/notifications/NotificationsWidget';
import { ID } from './UpsellTrigger';

const UpsellSidebar = () => {
  const intl = useIntl();
  const { hideNotificationbar, isNotificationbarAvailable } = useContext(SidebarContext);

  if (hideNotificationbar || !isNotificationbarAvailable) { return null; }

  return (
    <SidebarBase
      ariaLabel={intl.formatMessage(messages.upsellTitle)}
      sidebarId={ID}
      className="d-flex flex-column overflow-auto"
      showTitleBar={false}
      showBorder={false}
    >
      <NotificationsWidget />
    </SidebarBase>
  );
};

export default UpsellSidebar;
