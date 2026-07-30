import React from 'react';
import PropTypes from 'prop-types';
import { PluginSlot } from '@openedx/frontend-plugin-framework';

const CourseExitUpsellSlot = ({
  courseId,
  org,
  administrator,
  offer,
  verifiedMode,
}) => (
  <PluginSlot
    id="org.openedx.frontend-app-learning.course-exit-upsell.v1"
    idAliases={['course_exit_upsell_slot']}
    pluginProps={{
      courseId,
      org,
      administrator,
      offer,
      verifiedMode,
    }}
  />
);

CourseExitUpsellSlot.propTypes = {
  courseId: PropTypes.string.isRequired,
  org: PropTypes.string.isRequired,
  administrator: PropTypes.bool,
  offer: PropTypes.shape({
    code: PropTypes.string,
    percentage: PropTypes.number,
  }),
  verifiedMode: PropTypes.shape({
    upgradeUrl: PropTypes.string,
    accessExpirationDate: PropTypes.string,
  }),
};

CourseExitUpsellSlot.defaultProps = {
  administrator: false,
  offer: null,
  verifiedMode: null,
};

export default CourseExitUpsellSlot;
