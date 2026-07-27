import { PluginSlot } from '@openedx/frontend-plugin-framework';

import CourseGradeHeader from '../../course-home/progress-tab/grades/course-grade/CourseGradeHeader';

const ProgressTabCourseGradeHeaderSlot = () => (
  <PluginSlot
    id="org.openedx.frontend.learning.progress_tab_course_grade_header.v1"
    idAliases={['progress_tab_course_grade_header_slot']}
  >
    <CourseGradeHeader />
  </PluginSlot>
);

ProgressTabCourseGradeHeaderSlot.propTypes = {};

export default ProgressTabCourseGradeHeaderSlot;
