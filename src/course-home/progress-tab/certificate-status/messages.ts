import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  notPassingHeader: {
    id: 'progress.certificateStatus.notPassingHeader',
    defaultMessage: 'Certificate status',
    description: 'Header text when learner certifcate status is not passing',
  },
  notPassingBody: {
    id: 'progress.certificateStatus.notPassingBody',
    defaultMessage: 'In order to qualify for a certificate, you must have a passing grade.',
    description: 'Body text when learner certifcate status is not passing',
  },
  inProgressHeader: {
    id: 'progress.certificateStatus.inProgressHeader',
    defaultMessage: 'More content is coming soon!',
    description: 'Header text when learner certifcate is in progress',
  },
  inProgressBody: {
    id: 'progress.certificateStatus.inProgressBody',
    defaultMessage: 'It looks like there is more content in this course that will be released in the future. Look out for email updates or check back on your course for when this content will be available.',
    description: 'Body text when learner certifcate is in progress',
  },
  requestableHeader: {
    id: 'progress.certificateStatus.requestableHeader',
    defaultMessage: 'Certificate status',
    description: 'Header text when learner certifcate status is requestable',
  },
  requestableBody: {
    id: 'progress.certificateStatus.requestableBody',
    defaultMessage: 'Congratulations, you qualified for a certificate! In order to access your certificate, request it below.',
    description: 'Body text when learner certifcate status is requestable',
  },
  requestableButton: {
    id: 'progress.certificateStatus.requestableButton',
    defaultMessage: 'Request certificate',
    description: 'Button text when learner certifcate status is requestable',
  },
  unverifiedHeader: {
    id: 'progress.certificateStatus.unverifiedHeader',
    defaultMessage: 'Certificate status',
    description: 'Header text when learner certifcate status is unverified',
  },
  unverifiedButton: {
    id: 'progress.certificateStatus.unverifiedButton',
    defaultMessage: 'Verify ID',
    description: 'Button text when learner certifcate status is unverified',
  },
  unverifiedPendingBody: {
    id: 'progress.certificateStatus.courseCelebration.verificationPending',
    defaultMessage: 'Your ID verification is pending and your certificate will be available once approved.',
    description: 'Body text when learner certifcate status is unverified pending',
  },
  downloadableHeader: {
    id: 'progress.certificateStatus.downloadableHeader',
    defaultMessage: 'Your certificate is available!',
    description: 'Header text when the certifcate is available',
  },
  proctoringBlockedHeader: {
    id: 'progress.certificateStatus.proctoringBlockedHeader',
    defaultMessage: 'Certificate temporarily unavailable',
    description: 'Header text when certificate access is blocked by proctoring',
  },
  proctoringReviewPendingBody: {
    id: 'progress.certificateStatus.proctoringReviewPendingBody',
    defaultMessage: 'Your certificate is temporarily unavailable while your required proctored exam is being reviewed. Please check back after the review is complete.',
    description: 'Body text when a required proctored exam is pending review',
  },
  proctoringIncompleteBody: {
    id: 'progress.certificateStatus.proctoringIncompleteBody',
    defaultMessage: 'Complete your required proctored exam before accessing your certificate.',
    description: 'Body text when a required proctored exam is incomplete or not attempted',
  },
  proctoringUnavailableBody: {
    id: 'progress.certificateStatus.proctoringUnavailableBody',
    defaultMessage: 'Your certificate is temporarily unavailable because the proctoring result is still being confirmed. Please check back later.',
    description: 'Body text when the proctoring status cannot be confirmed',
  },
  viewableButton: {
    id: 'progress.certificateStatus.viewableButton',
    defaultMessage: 'View my certificate',
    description: 'Button text which view or links to the certifcate',
  },
  notAvailableHeader: {
    id: 'progress.certificateStatus.notAvailableHeader',
    defaultMessage: 'Certificate status',
    description: 'Header text when the certifcate is not available',
  },
  notAvailableEndDateBody: {
    id: 'progress.certificateBody.notAvailable.endDate',
    defaultMessage: 'Final grades and any earned certificates are scheduled to be available after {endDate}.',
    description: 'Shown for learners who have finished a course before grades and certificates are available.',
  },
  upgradeHeader: {
    id: 'progress.certificateStatus.upgradeHeader',
    defaultMessage: 'Earn a certificate',
    description: 'Header text when the learner needs to upgrade to earn a certifcate ',
  },
  upgradeBody: {
    id: 'progress.certificateStatus.upgradeBody',
    defaultMessage: 'You are in an audit track and do not qualify for a certificate. In order to work towards a certificate, upgrade your course today.',
    description: 'Body text when the learner needs to upgrade to earn a certifcate ',
  },
  upgradeButton: {
    id: 'progress.certificateStatus.upgradeButton',
    defaultMessage: 'Upgrade now',
    description: 'Button text which leaner needs to upgrade to get the certifcate',
  },
  unverifiedHomeHeader: {
    id: 'progress.certificateStatus.unverifiedHomeHeader.v2',
    defaultMessage: 'Verify your identity to qualify for a certificate.',
    description: 'Header text when the learner needs to do verification to earn a certifcate ',
  },
  unverifiedHomeButton: {
    id: 'progress.certificateStatus.unverifiedHomeButton',
    defaultMessage: 'Verify my ID',
    description: 'Button text which leaner needs to do verification to earn a certifcate',
  },
  unverifiedHomeBody: {
    id: 'progress.certificateStatus.unverifiedHomeBody',
    defaultMessage: 'In order to generate a certificate for this course, you must complete the ID verification process.',
    description: 'Body text when the learner needs to do verification to earn a certifcate',
  },
});

export const getProctoringBlockedMessage = (reason) => {
  if (reason === 'proctoring_review_pending') {
    return messages.proctoringReviewPendingBody;
  }
  if (reason === 'proctored_exam_not_attempted' || reason === 'proctored_exam_incomplete') {
    return messages.proctoringIncompleteBody;
  }
  return messages.proctoringUnavailableBody;
};

export default messages;
