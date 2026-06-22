import React, { useContext, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, IconButton } from '@openedx/paragon';
import { useModel } from '../../../../../generic/model-store';
import { getCourseDiscussionTopics } from '../../../../data/thunks';
import { RightSidebarFilled, RightSidebarOutlined } from '../../icons';
import messages from '../../messages';
import SidebarContext from '../../SidebarContext';

export const ID = 'DISCUSSIONS';

const DiscussionsTrigger = ({ onClick }) => {
  const {
    courseId,
    currentSidebar,
    isDiscussionbarAvailable,
  } = useContext(SidebarContext);

  const dispatch = useDispatch();
  const intl = useIntl();
  const { tabs } = useModel('courseHomeMeta', courseId);
  const baseUrl = getConfig().DISCUSSIONS_MFE_BASE_URL;
  const edxProvider = useMemo(
    () => tabs?.find(tab => tab.slug === 'discussion'),
    [tabs],
  );

  const sidebarIcon = currentSidebar === ID ? RightSidebarFilled : RightSidebarOutlined;

  useEffect(() => {
    if (baseUrl && edxProvider) {
      dispatch(getCourseDiscussionTopics(courseId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, baseUrl, edxProvider]);

  if (!isDiscussionbarAvailable) { return null; }

  return (
    <IconButton
      src={sidebarIcon}
      iconAs={Icon}
      onClick={onClick}
      alt={intl.formatMessage(messages.openSidebarTrigger)}
      className="icon-hover"
    />
  );
};

DiscussionsTrigger.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default DiscussionsTrigger;
