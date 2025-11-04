import React from 'react';
import {
  render, screen, fireEvent, initializeMockApp,
} from '../../../../setupTest';
import AssignmentLock from './AccessLock';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Assignment Lock', () => {
  const mockData = {
    courseId: 'test-course-id',
    prereqSectionName: 'test-prerequisite-section-name',
    prereqId: 'test-prerequisite-id',
    sequenceTitle: 'test-sequence-title',
  };

  beforeAll(async () => {
    await initializeMockApp();
  });

  it('displays sequence title along with lock icon', () => {
    const { container } = render(<AssignmentLock {...mockData} />, { wrapWithRouter: true });

    const lockIcon = container.querySelector('svg');
    expect(lockIcon).toHaveClass('fa-lock');
    expect(lockIcon.parentElement).toHaveTextContent(mockData.sequenceTitle);
  });

});
