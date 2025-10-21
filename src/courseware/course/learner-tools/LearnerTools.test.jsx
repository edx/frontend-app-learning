import { screen, render } from '@testing-library/react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import LearnerTools from './LearnerTools';

// Mock getAuthenticatedUser
jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: jest.fn(),
}));

// Capture props passed into PluginSlot for assertions
const mockPluginSlotSpy = jest.fn(() => null);
jest.mock('@openedx/frontend-plugin-framework', () => ({
  // Provide a minimal mock PluginSlot component that records props
  PluginSlot: (props) => {
    mockPluginSlotSpy(props);
    return <div data-testid="plugin-slot-mock" />;
  },
}));

describe('LearnerTools component', () => {
  const baseProps = {
    enrollmentMode: 'audit',
    isStaff: false,
    courseId: 'course-v1:edX+DemoX+2024',
    unitId: 'block-v1:edX+DemoX+2024+type@sequential+block@seq123',
  };

  beforeEach(() => {
    mockPluginSlotSpy.mockClear();
    // Default: authenticated user
    getAuthenticatedUser.mockReturnValue({ userId: 'user-123' });
  });

  it('renders PluginSlot via portal when enabled', () => {
    render(<LearnerTools {...baseProps} />);
    // Our mock PluginSlot renders a marker div in document.body via portal
    expect(screen.getByTestId('plugin-slot-mock')).toBeInTheDocument();
    expect(mockPluginSlotSpy).toHaveBeenCalledTimes(1);
  });

  it('passes correct pluginProps to PluginSlot', () => {
    render(<LearnerTools {...baseProps} />);
    const call = mockPluginSlotSpy.mock.calls[0][0];
    expect(call.id).toBe('learner_tools_slot');
    expect(call.pluginProps).toEqual({
      courseId: baseProps.courseId,
      unitId: baseProps.unitId,
      userId: 'user-123',
      isStaff: baseProps.isStaff,
      enrollmentMode: baseProps.enrollmentMode,
    });
  });

  it('allows null enrollmentMode (omitted prop) and still passes context', () => {
    render(<LearnerTools {...baseProps} enrollmentMode={null} />);
    const call = mockPluginSlotSpy.mock.calls[0][0];
    expect(call.pluginProps.enrollmentMode).toBeNull();
  });

  it('propagates isStaff=true correctly', () => {
    render(<LearnerTools {...baseProps} isStaff />);
    const call = mockPluginSlotSpy.mock.calls[0][0];
    expect(call.pluginProps.isStaff).toBe(true);
  });

  it('returns null when user is not authenticated', () => {
    getAuthenticatedUser.mockReturnValue(null);
    const { container } = render(<LearnerTools {...baseProps} />);
    // Component should return null and not render anything
    expect(container.firstChild).toBeNull();
    expect(mockPluginSlotSpy).not.toHaveBeenCalled();
  });
});
