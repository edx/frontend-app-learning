import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import CompleteIcon from '../sequence-navigation/CompleteIcon';
import { Button } from '@openedx/paragon';
import messages from './messages';

const AccessLock = ({
  courseId
}) => {
  const intl = useIntl();
  const handleClick = () => {};

  const Check = <CompleteIcon size="md" className="mr-2" />;
  const DisplayPrice = () => {
    return (<>
    <span>{intl.formatMessage(messages['learn.accessLock.upgrade.buttonText'])}</span>
    <span className='large-weight'>$118.15 </span>
    <span style= {{ textDecoration: 'line-through' }}>($139)</span>
    </>)
  };
  return (
    <>
          <h3>
            <FontAwesomeIcon icon={faLock} />
            {intl.formatMessage(messages['learn.accessLock.content.locked'])}
          </h3>
          <p>
            {intl.formatMessage(messages['learn.accessLock.upgrade'])}
          </p>
      <div className="d-flex flex-grow-1 justify-between items-start">
        <div>
          <p>
            {intl.formatMessage(messages['learn.accessLock.upgrade.header'])}
          </p>
          <ul className="list-unstyled mr-4">
            <li>{Check}{intl.formatMessage(messages['learn.accessLock.upgrade.benefitOne'])}</li>
            <li>{Check}{intl.formatMessage(messages['learn.accessLock.upgrade.benefitTwo'])}</li>
            <li>{Check}{intl.formatMessage(messages['learn.accessLock.upgrade.benefitThree'])}</li>
            <li>{Check}{intl.formatMessage(messages['learn.accessLock.upgrade.benefitFour'])}</li>
          </ul>
        </div>
        <div className='d-flex items-right pl-6'>
          <p>
            <Button variant="primary" onClick={handleClick}> <DisplayPrice /></Button>
          </p>
      </div>
      </div>
    </>
  );
};
AccessLock.propTypes = {
  courseId: PropTypes.string.isRequired,
};
export default AccessLock;
