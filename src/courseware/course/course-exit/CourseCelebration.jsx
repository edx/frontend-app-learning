import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

import { FormattedDate, FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import {
  Alert,
  breakpoints,
  Button,
  useWindowSize,
} from '@openedx/paragon';
import { CheckCircle } from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import CelebrationMobile from './assets/celebration_456x328.gif';
import CelebrationDesktop from './assets/celebration_750x540.gif';
import certificate from '../../../generic/assets/edX_certificate.png';
import messages from './messages';
import { useModel } from '../../../generic/model-store';
import { requestCert } from '../../../course-home/data/thunks';
import ProgramCompletion from './ProgramCompletion';
import SocialIcons from '../../social-share/SocialIcons';
import { logClick, logVisit } from './utils';
import { DashboardLink, IdVerificationSupportLink, ProfileLink } from '../../../shared/links';
import DashboardFootnote from './DashboardFootnote';
import { CourseRecommendationsSlot } from '../../../plugin-slots/CourseExitPluginSlots';
import CourseExitUpsellSlot from '../../../plugin-slots/CourseExitUpsellSlot';

const LINKEDIN_BLUE = '#2867B2';

const CourseCelebration = () => {
  const intl = useIntl();
  const wideScreen = useWindowSize().width >= breakpoints.medium.minWidth;
  const { courseId } = useSelector(state => state.courseware);
  const dispatch = useDispatch();
  const {
    certificateData,
    end,
    linkedinAddToProfileUrl,
    marketingUrl,
    offer,
    relatedPrograms,
    title,
    verifyIdentityUrl,
    verificationStatus,
  } = useModel('coursewareMeta', courseId);

  const {
    org,
    verifiedMode,
    canViewCertificate,
    userTimezone,
  } = useModel('courseHomeMeta', courseId);

  const {
    certStatus,
    certWebViewUrl,
    certificateAvailableDate,
    certificateBlockedDueToProctoring,
    certificateBlockReason,
  } = certificateData || {};

  const { administrator } = getAuthenticatedUser();

  const dashboardLink = <DashboardLink />;
  const idVerificationSupportLink = <IdVerificationSupportLink />;
  const profileLink = <ProfileLink />;
  const timezoneFormatArgs = userTimezone ? { timeZone: userTimezone } : {};

  let buttonPrefix = null;
  let buttonLocation;
  let buttonText;
  const buttonVariant = 'outline-primary';
  let buttonEvent = null;
  const buttonSuffix = null;
  const certificateImage = certificate;
  let footnote;
  let message;
  let certHeader;
  let certificateAlertVariant = 'success';
  let certificateAlertIcon = CheckCircle;
  let visitEvent = 'celebration_generic';

  switch (certStatus) {
    case 'downloadable':
      if (certificateBlockedDueToProctoring) {
        certificateAlertVariant = 'warning';
        certificateAlertIcon = faExclamationTriangle;
        certHeader = intl.formatMessage(messages.certificateHeaderProctoringBlocked);
        if (certificateBlockReason === 'proctoring_review_pending') {
          message = <p>{intl.formatMessage(messages.certificateProctoringReviewPendingBody)}</p>;
        } else if (certificateBlockReason === 'proctored_exam_not_attempted'
          || certificateBlockReason === 'proctored_exam_incomplete') {
          message = <p>{intl.formatMessage(messages.certificateProctoringIncompleteBody)}</p>;
        } else {
          message = <p>{intl.formatMessage(messages.certificateProctoringUnavailableBody)}</p>;
        }
        visitEvent = 'celebration_with_unavailable_cert';
        footnote = <DashboardFootnote variant={visitEvent} />;
      } else {
        certHeader = intl.formatMessage(messages.certificateHeaderDownloadable);
        message = (
          <p>
            <FormattedMessage
              id="courseCelebration.certificateBody.available"
              defaultMessage="
                Showcase your accomplishment on LinkedIn or your resumé today.
                You can download your certificate now and access it any time from your
                {dashboardLink} and {profileLink}."
              values={{ dashboardLink, profileLink }}
              description="Recommending an action for learner when course certificate is available"
            />
          </p>
        );
        if (certWebViewUrl) {
          buttonLocation = `${getConfig().LMS_BASE_URL}${certWebViewUrl}`;
          buttonText = intl.formatMessage(messages.viewCertificateButton);
        }
        if (linkedinAddToProfileUrl) {
          buttonPrefix = (
            <Button
              className="mr-3"
              href={linkedinAddToProfileUrl}
              onClick={() => logClick(org, courseId, administrator, 'linkedin_add_to_profile')}
              style={{ backgroundColor: LINKEDIN_BLUE, border: 'none' }}
            >
              <FontAwesomeIcon icon={faLinkedinIn} className="mr-3" />
              {`${intl.formatMessage(messages.linkedinAddToProfileButton)}`}
            </Button>
          );
        }
        buttonEvent = 'view_cert';
        visitEvent = 'celebration_with_cert';
        footnote = <DashboardFootnote variant={visitEvent} />;
      }
      break;
    case 'earned_but_not_available': {
      const endDate = <FormattedDate value={end} day="numeric" month="long" year="numeric" />;
      const certAvailableDate = <FormattedDate value={certificateAvailableDate} day="numeric" month="long" year="numeric" />;
      certHeader = intl.formatMessage(messages.certificateHeaderNotAvailable);
      message = (
        <>
          <p>
            <FormattedMessage
              id="courseCelebration.certificateBody.notAvailable.endDate.v2"
              defaultMessage="This course ends on {endDate}. Final grades and any earned certificates are
              scheduled to be available after {certAvailableDate}."
              values={{ endDate, certAvailableDate }}
              description="This shown for leaner when they are eligible for certifcate but it't not available yet, it could because leaners just finished the course quickly!"
            />
          </p>
          <p>
            {intl.formatMessage(messages.certificateNotAvailableBodyAccessCert)}
          </p>
        </>
      );
      visitEvent = 'celebration_with_unavailable_cert';
      footnote = <DashboardFootnote variant={visitEvent} />;
      break;
    }
    case 'requesting':
      buttonEvent = 'request_cert';
      buttonPrefix = (
        <Button
          variant={buttonVariant}
          onClick={() => {
            logClick(org, courseId, administrator, buttonEvent);
            dispatch(requestCert(courseId));
          }}
        >
          {intl.formatMessage(messages.requestCertificateButton)}
        </Button>
      );
      certHeader = intl.formatMessage(messages.certificateHeaderRequestable);
      message = (<p>{intl.formatMessage(messages.requestCertificateBodyText)}</p>);
      visitEvent = 'celebration_with_requestable_cert';
      footnote = <DashboardFootnote variant={visitEvent} />;
      break;
    case 'unverified':
      certHeader = intl.formatMessage(messages.certificateHeaderUnverified);
      visitEvent = 'celebration_unverified';
      footnote = <DashboardFootnote variant={visitEvent} />;
      if (verificationStatus === 'pending') {
        message = (<p>{intl.formatMessage(messages.verificationPending)}</p>);
      } else {
        buttonText = intl.formatMessage(messages.verifyIdentityButton);
        buttonEvent = 'verify_id';
        buttonLocation = verifyIdentityUrl;
        message = (
          <p>
            <FormattedMessage
              id="courseCelebration.certificateBody.unverified"
              defaultMessage="In order to generate a certificate, you must complete ID verification.
                {idVerificationSupportLink} now."
              values={{ idVerificationSupportLink }}
              description="Its shown when learner are not verified thus it recommends going over the verification process"
            />
          </p>
        );
      }
      break;
    case 'audit_passing':
    case 'honor_passing':
      if (verifiedMode) {
        visitEvent = 'celebration_upgrade';
        if (!verifiedMode.accessExpirationDate) {
          footnote = <DashboardFootnote variant={visitEvent} />;
        }
      } else {
        visitEvent = 'celebration_audit_no_upgrade';
      }
      break;
    default:
      if (!canViewCertificate) {
        visitEvent = 'celebration_with_unavailable_cert';
        certHeader = intl.formatMessage(messages.certificateHeaderNotAvailable);
        const endDate = intl.formatDate(end, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          ...timezoneFormatArgs,
        });
        message = (
          <>
            <p>
              {intl.formatMessage(messages.certificateNotAvailableEndDateBody, { endDate })}
            </p>
            <p>
              {intl.formatMessage(messages.certificateNotAvailableBodyAccessCert)}
            </p>
          </>
        );
      }
      break;
  }

  useEffect(() => {
    if (visitEvent !== 'celebration_upgrade') {
      logVisit(org, courseId, administrator, visitEvent);
    }
  }, [org, courseId, administrator, visitEvent]);

  return (
    <>
      <Helmet>
        <title>{`${intl.formatMessage(messages.congratulationsHeader)} | ${title} | ${getConfig().SITE_NAME}`}</title>
      </Helmet>
      <div className="row w-100 mx-0 mb-4 px-5 py-4 border border-light">
        <div className="col-12 p-0 h2 text-center">
          {intl.formatMessage(messages.congratulationsHeader)}
        </div>
        <div className="col-12 p-0 font-weight-normal lead text-center">
          {intl.formatMessage(messages.completedCourseHeader)}
          {marketingUrl && ` ${intl.formatMessage(messages.shareMessage)}`}
          <SocialIcons
            analyticsId="edx.ui.lms.course_exit.social_share.clicked"
            className="mt-2"
            courseId={courseId}
            emailSubject={messages.socialMessage}
            socialMessage={messages.socialMessage}
          />
        </div>
        <div className="col-12 mt-3 mb-4 px-0 px-md-5 text-center">
          {!wideScreen && (
            <img
              src={CelebrationMobile}
              alt={`${intl.formatMessage(messages.congratulationsImage)}`}
              className="img-fluid"
            />
          )}
          {wideScreen && (
            <img
              src={CelebrationDesktop}
              alt={`${intl.formatMessage(messages.congratulationsImage)}`}
              className="img-fluid"
              style={{ width: '36rem' }}
            />
          )}
        </div>
        <div className="col-12 px-0 px-md-5">
          {visitEvent === 'celebration_upgrade' && (
            <CourseExitUpsellSlot
              courseId={courseId}
              org={org}
              administrator={administrator}
              offer={offer}
              verifiedMode={verifiedMode}
            />
          )}
          {certHeader && (
          <Alert variant={certificateAlertVariant} icon={certificateAlertIcon}>
            <div className="row w-100 m-0">
              <div className="col order-1 order-md-0 pl-0 pr-0 pr-md-5">
                <div className="h4">{certHeader}</div>
                {message}
                <div className="mt-2">
                  {buttonPrefix}
                  {buttonLocation && (
                    <Button
                      variant={buttonVariant}
                      href={buttonLocation}
                      className="w-xs-100 w-md-auto"
                      onClick={() => logClick(org, courseId, administrator, buttonEvent)}
                    >
                      {buttonText}
                    </Button>
                  )}
                  {buttonSuffix}
                </div>
              </div>
              {certStatus !== 'unverified' && !certificateBlockedDueToProctoring && (
                <div className="col-12 order-0 col-md-3 order-md-1 w-100 mb-3 p-0 text-center">
                  <img
                    src={certificateImage}
                    alt={`${intl.formatMessage(messages.certificateImage)}`}
                    className="w-100"
                    style={{ maxWidth: '13rem' }}
                  />
                </div>
              )}
            </div>
          </Alert>
          )}
          {relatedPrograms && relatedPrograms.map(program => (
            <ProgramCompletion
              key={program.uuid}
              progress={program.progress}
              title={program.title}
              type={program.slug}
              url={program.url}
            />
          ))}
          {footnote}
          <CourseRecommendationsSlot variant={visitEvent} />
        </div>
      </div>
    </>
  );
};

export default CourseCelebration;
