import React from 'react';
import { Factory } from 'rosie';
import { getConfig } from '@edx/frontend-platform';
import { sendTrackEvent, sendTrackingLogEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import MockAdapter from 'axios-mock-adapter';
import userEvent from '@testing-library/user-event';

import {
  fireEvent, initializeMockApp, logUnhandledRequests, render, screen, waitFor, act,
} from '../../../setupTest';
import { appendBrowserTimezoneToUrl, executeThunk } from '../../../utils';
import * as thunks from '../../data/thunks';
import initializeStore from '../../../store';
import UpgradeCard from './UpgradeCard';

initializeMockApp();
jest.mock('@edx/frontend-platform/analytics');

/*
Emma To Do:
- Mock now()
- Figure out how to do getTextWithMarkup
*/

describe('Upgrade Card', () => {
    function buildAndRender(attributes){
        const upgradeCardData = Factory.build('upgradeCardData', {...attributes});
        render(<UpgradeCard {...upgradeCardData}/>)
    }

    it('does not render when there is no verified mode', async () => {
        buildAndRender({verifiedMode: null})
        expect(screen.queryByRole('link', { name: 'Upgrade ($149)' })).not.toBeInTheDocument();
    });

    it('renders non-FBE when there is a verified mode but no FBE', async () => {
        buildAndRender()
        expect(screen.getByRole('heading', { name: 'Pursue a verified certificate' })).toBeInTheDocument();
        expect(screen.getByText(/Earn a.*?of completion to showcase on your resume/s)).toBeInTheDocument();
        expect(screen.getByText(/Support our.*?at edX/s)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Upgrade ($149)' })).toBeInTheDocument();
    });
    
    it('renders FBE expiration within an hour properly', async () => {
        const expirationDate = new Date()
        expirationDate.setMinutes(expirationDate.getMinutes() + 45)
        buildAndRender({
            accessExpiration: {
                expirationDate: expirationDate,
            },
            contentTypeGatingEnabled: true,
        })
        expect(screen.getByRole('heading', { name: 'Course Access Expiration' })).toBeInTheDocument();
        expect(screen.getByText('Less than 1 hour left')).toBeInTheDocument();
        expect(screen.getByText(/You will lose all access to this course.*?on/s)).toBeInTheDocument();
        expect(screen.getByText(/Upgrading your course enables you to pursue a verified certificate and unlocks numerous features\. Learn more about the/s)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Upgrade ($149)' })).toBeInTheDocument();
    });

    it('renders FBE expiration within 24 hours properly', async () => {
        const expirationDate = new Date()
        expirationDate.setHours(expirationDate.getHours() + 12)
        buildAndRender({
            accessExpiration: {
                expirationDate: expirationDate,
            },
            contentTypeGatingEnabled: true,
        })
        expect(screen.getByRole('heading', { name: 'Course Access Expiration' })).toBeInTheDocument();
        expect(screen.getByText('11 hours left')).toBeInTheDocument(); //setting the time to 12 will mean that it's slightly less than 12
        expect(screen.getByText(/You will lose all access to this course.*?on/s)).toBeInTheDocument();
        expect(screen.getByText(/Upgrading your course enables you to pursue a verified certificate and unlocks numerous features\. Learn more about the/s)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Upgrade ($149)' })).toBeInTheDocument();
    });

    it('renders FBE expiration within 7 days properly', async () => {
        const expirationDate = new Date()
        expirationDate.setDate(expirationDate.getDate() + 6)
        buildAndRender({
            accessExpiration: {
                expirationDate: expirationDate,
            },
            contentTypeGatingEnabled: true,
        })
        expect(screen.getByRole('heading', { name: 'Course Access Expiration' })).toBeInTheDocument();
        expect(screen.getByText('5 days left')).toBeInTheDocument(); //setting the time to 12 will mean that it's slightly less than 12
        expect(screen.getByText(/You will lose all access to this course.*?on/s)).toBeInTheDocument();
        expect(screen.getByText(/Upgrading your course enables you to pursue a verified certificate and unlocks numerous features\. Learn more about the/s)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Upgrade ($149)' })).toBeInTheDocument();
    });

    it('renders FBE expiration greater than 7 days properly', async () => {
        const expirationDate = new Date()
        expirationDate.setDate(expirationDate.getDate() + 14)
        const options = {day: "numeric", month: "long"}
        const expirationDateDisplay = expirationDate.toLocaleDateString("en-US", options)
        console.log('expirationDateDisplay', expirationDateDisplay)
        buildAndRender({
            accessExpiration: {
                expirationDate: expirationDate,
            },
            contentTypeGatingEnabled: true,
        })
        expect(screen.getByRole('heading', { name: 'Upgrade your course today' })).toBeInTheDocument();
        expect(screen.getByText(new RegExp(('Course access will expire.*?' + expirationDateDisplay), 's'))).toBeInTheDocument(); 
        expect(screen.getByText(/Earn a.*?of completion to showcase on your resume/s)).toBeInTheDocument();
        expect(screen.getByText(/Unlock your access to all course activities, including .*?/s)).toBeInTheDocument();
        expect(screen.getByText(/.*?to course content and materials, even after the course ends/s)).toBeInTheDocument();
        expect(screen.getByText(/Support our.*?at edX/s)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Upgrade ($149)' })).toBeInTheDocument();
    });

    it('renders discount less than an hour properly', async () => {
        const accessExpirationDate = new Date()
        accessExpirationDate.setDate(expirationDate.getDate() + 21)
        const discountExpirationDate = new Date(accessExpirationDate)
        discountExpirationDate.setDate(expirationDate.getDate() - 6)
        buildAndRender({
            accessExpiration: {
                expirationDate: expirationDate,
            },
            contentTypeGatingEnabled: true,
            offer: {
                expirationDate: discountExpirationDate,
                percentage: 15,
                code: 'Welcome15',

            }
        })
        expect(screen.getByRole('heading', { name: 'Upgrade your course today' })).toBeInTheDocument();
        // expect(screen.getByText(new RegExp(('Course access will expire.*?' + expirationDateDisplay), 's'))).toBeInTheDocument(); 
        expect(screen.getByText(/Earn a.*?of completion to showcase on your resume/s)).toBeInTheDocument();
        expect(screen.getByText(/Unlock your access to all course activities, including .*?/s)).toBeInTheDocument();
        expect(screen.getByText(/.*?to course content and materials, even after the course ends/s)).toBeInTheDocument();
        expect(screen.getByText(/Support our.*?at edX/s)).toBeInTheDocument();
        // expect(screen.getByRole('link', { name: 'Upgrade ($149)' })).toBeInTheDocument();
    });

   
});