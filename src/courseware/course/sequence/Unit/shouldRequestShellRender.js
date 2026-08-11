import { getConfig } from '@edx/frontend-platform';

/**
 * Decide whether this unit should request LMS shell mode.
 * Requires ENABLE_LAZY_XBLOCK_LOAD. If sequence metadata provides
 * hasLargeLibraryContent, honor it; otherwise request shell and let LMS
 * waffle + threshold decide (falls back to full when ineligible).
 */
export const shouldRequestShellRender = (unit) => {
  const enabled = Boolean(getConfig().ENABLE_LAZY_XBLOCK_LOAD);
  if (!enabled) {
    return false;
  }
  // Explicit false from sequence metadata → skip. True or omitted → request shell
  // (LMS waffle + LARGE_VERTICAL_PROBLEM_THRESHOLD still gate actual shell behavior).
  if (unit && unit.hasLargeLibraryContent === false) {
    return false;
  }
  return true;
};

export default shouldRequestShellRender;
