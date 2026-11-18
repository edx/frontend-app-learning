import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  lockedCertificateHeader: {
    id: 'certificateHold.lockedCertificate.header',
    defaultMessage: 'Certificate is pending',
    description: 'Header shown to a learner who passed the course during the free trial of their subscription, whose certificate is held until the paid subscription starts',
  },
  lockedCertificateBodyWithDate: {
    id: 'certificateHold.lockedCertificate.body.withDate',
    defaultMessage: 'Your certificate will be issued automatically on {unlockDate} when your paid edX Plus subscription starts.',
    description: 'Shown to a learner who passed the course during the free trial of their subscription. {unlockDate} is the date the free trial ends, for example "December 1, 2026"',
  },
  lockedCertificateBody: {
    id: 'certificateHold.lockedCertificate.body',
    defaultMessage: 'Your certificate will be issued automatically when your paid edX Plus subscription starts.',
    description: 'Shown to a learner who passed the course during the free trial of their subscription, when the date the free trial ends is not known',
  },
});

export default messages;
