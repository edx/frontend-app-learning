import React, { useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import SidebarBase from '../../common/SidebarBase';
import messages from '../../messages';
import SidebarContext from '../../SidebarContext';
import DiscussionsWidget from '../discussions-notifications/discussions/DiscussionsWidget';
import { ID } from './DiscussionsTrigger';

const DiscussionsSidebar = () => {
  const intl = useIntl();
  const { hideDiscussionbar, isDiscussionbarAvailable } = useContext(SidebarContext);

  if (hideDiscussionbar || !isDiscussionbarAvailable) { return null; }

  return (
    <SidebarBase
      ariaLabel={intl.formatMessage(messages.discussionsTitle)}
      sidebarId={ID}
      className="d-flex flex-column flex-fill overflow-auto"
      showTitleBar={false}
      showBorder={false}
    >
      <DiscussionsWidget />
    </SidebarBase>
  );
};

export default DiscussionsSidebar;
