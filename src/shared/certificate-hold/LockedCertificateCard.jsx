import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { Card, Image } from '@openedx/paragon';

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
    <Card className="mb-4 shadow-none border border-gray-200" data-testid="locked-certificate-card">
      <Card.Header title={<h2 className="h3 m-0">{lockedCertificate.header}</h2>} />
      <Card.Section className="text-gray-700">
        {lockedCertificate.body}
      </Card.Section>
      <Card.Section className="pt-0">
        <Image
          src={certificateLocked}
          alt=""
          className="d-block ml-auto w-100"
          style={{ maxWidth: '13rem' }}
        />
      </Card.Section>
    </Card>
  );
};

LockedCertificateCard.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default LockedCertificateCard;
