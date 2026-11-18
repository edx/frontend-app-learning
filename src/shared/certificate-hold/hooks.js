import { useIntl } from '@edx/frontend-platform/i18n';

import { useModel } from '../../generic/model-store';
import messages from './messages';

/**
 * The text of the locked certificate of a learner on the free trial of the edX subscription, or null.
 *
 * The edx-subscription plugin holds the certificate of a learner on the free trial, in a course that the
 * subscription unlocked (LP-1525). It tells the course home metadata API about the hold in
 * extra_offer.certificate_hold (LP-1527):
 *
 *     { held: true, unlocks_on: <the end of the free trial, or null> }
 *
 * The block is only there when the certificate is held. unlocks_on is null when the end of the free trial is not
 * known, when the learner cancelled during the free trial, or when their subscription status could not be read, so
 * the message without a date does not say when the paid subscription starts.
 *
 * The certificate shows as locked when it is held and the learner passed, in place of the certificate status. A
 * certificate that was already issued is never hidden.
 *
 * Returns { header, body }, or null when the certificate is not locked.
 */
export function useLockedCertificate(courseId, certStatus, userHasPassingGrade) {
  const intl = useIntl();
  const { extraOffer, userTimezone } = useModel('courseHomeMeta', courseId);
  const { held, unlocksOn } = extraOffer?.certificateHold || {};

  if (!held || !userHasPassingGrade || certStatus === 'downloadable') {
    return null;
  }

  const header = intl.formatMessage(messages.lockedCertificateHeader);

  if (!unlocksOn) {
    return { header, body: intl.formatMessage(messages.lockedCertificateBody) };
  }

  const unlockDate = intl.formatDate(unlocksOn, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(userTimezone ? { timeZone: userTimezone } : {}),
  });
  return { header, body: intl.formatMessage(messages.lockedCertificateBodyWithDate, { unlockDate }) };
}

export default useLockedCertificate;
