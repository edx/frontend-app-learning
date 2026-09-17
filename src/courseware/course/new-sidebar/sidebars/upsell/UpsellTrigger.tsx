import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, IconButton } from '@openedx/paragon';
import { getLocalStorage, setLocalStorage } from '../../../../../data/localStorage';
import { getSessionStorage, setSessionStorage } from '../../../../../data/sessionStorage';
import { RightSidebarFilled, RightSidebarOutlined } from '../../icons';
import messages from '../../messages';
import SidebarContext from '../../SidebarContext';

export const ID = 'UPSELL';

const UpsellTrigger = ({ onClick }) => {
  const {
    courseId,
    currentSidebar,
    setNotificationStatus,
    upgradeNotificationCurrentState,
    isNotificationbarAvailable,
  } = useContext(SidebarContext);

  const intl = useIntl();
  const sidebarIcon = currentSidebar === ID ? RightSidebarFilled : RightSidebarOutlined;

  function updateUpgradeNotificationLastSeen() {
    if (upgradeNotificationCurrentState) {
      if (getLocalStorage(`upgradeNotificationLastSeen.${courseId}`) !== upgradeNotificationCurrentState) {
        setNotificationStatus('active');
        setLocalStorage(`notificationStatus.${courseId}`, 'active');
        setLocalStorage(`upgradeNotificationLastSeen.${courseId}`, upgradeNotificationCurrentState);
      }
    }
  }

  if (!getLocalStorage(`notificationStatus.${courseId}`)) {
    setLocalStorage(`notificationStatus.${courseId}`, 'active');
  }

  if (!getLocalStorage(`upgradeNotificationCurrentState.${courseId}`)) {
    setLocalStorage(`upgradeNotificationCurrentState.${courseId}`, 'initialize');
  }

  useEffect(() => {
    updateUpgradeNotificationLastSeen();
  });

  const handleClick = () => {
    if (getSessionStorage(`notificationTrayStatus.${courseId}`) === 'open') {
      setSessionStorage(`notificationTrayStatus.${courseId}`, 'closed');
    } else {
      setSessionStorage(`notificationTrayStatus.${courseId}`, 'open');
    }
    onClick();
  };

  if (!isNotificationbarAvailable) { return null; }

  return (
    <IconButton
      src={sidebarIcon}
      iconAs={Icon}
      onClick={handleClick}
      alt={intl.formatMessage(messages.openSidebarTrigger)}
      className="icon-hover"
    />
  );
};

UpsellTrigger.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default UpsellTrigger;
