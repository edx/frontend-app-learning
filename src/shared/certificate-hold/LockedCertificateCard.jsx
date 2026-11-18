import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import certificateLocked from '../../generic/assets/edX_locked_certificate.png';
import { useModel } from '../../generic/model-store';
import { useLockedCertificate } from './hooks';

/**
 * The locked certificate in the sidebar of the course outline, for a learner on the free trial of the edX
 * subscription who passed the course (see useLockedCertificate).
 */
const LockedCertificateCard = ({ courseId }) => {
  const { org } = useModel('courseHomeMeta', courseId);
  const { certData, userHasPassingGrade } = useModel('outline', courseId);
  const lockedCertificate = useLockedCertificate(courseId, certData?.certStatus, userHasPassingGrade);
  const isVisible = !!lockedCertificate;

  useEffect(() => {
    if (isVisible) {
      sendTrackEvent('edx.ui.lms.course_outline.certificate_held.viewed', {
        org_key: org,
        courserun_key: courseId,
        is_staff: getAuthenticatedUser().administrator,
      });
    }
  }, [isVisible, org, courseId]);

  if (!isVisible) {
    return null;
  }

  return (
    <section
      className="mb-4 p-4 border rounded bg-white d-flex flex-column"
      style={{ gap: '2rem' }}
      data-testid="locked-certificate-card"
    >
      <h2 className="h3 m-0">{lockedCertificate.header}</h2>
      <p className="m-0 text-gray-700">{lockedCertificate.body}</p>
      <img
        src={certificateLocked}
        alt=""
        className="d-block ml-auto w-100"
        style={{ maxWidth: '13rem' }}
      />
    </section>
  );
};

LockedCertificateCard.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default LockedCertificateCard;
