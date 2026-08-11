import { getConfig } from '@edx/frontend-platform';

import { shouldRequestShellRender } from './shouldRequestShellRender';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
}));

describe('shouldRequestShellRender', () => {
  beforeEach(() => {
    getConfig.mockReturnValue({ ENABLE_LAZY_XBLOCK_LOAD: true });
  });

  test('returns false when feature flag is off', () => {
    getConfig.mockReturnValue({ ENABLE_LAZY_XBLOCK_LOAD: false });
    expect(shouldRequestShellRender({ hasLargeLibraryContent: true })).toBe(false);
  });

  test('returns false when unit explicitly marks content as small', () => {
    expect(shouldRequestShellRender({ hasLargeLibraryContent: false })).toBe(false);
  });

  test('returns true when flag is on and metadata omits hasLargeLibraryContent', () => {
    expect(shouldRequestShellRender({})).toBe(true);
    expect(shouldRequestShellRender(undefined)).toBe(true);
  });

  test('returns true when flag is on and hasLargeLibraryContent is true', () => {
    expect(shouldRequestShellRender({ hasLargeLibraryContent: true })).toBe(true);
  });
});
