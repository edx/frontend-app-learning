export const modelKeys = {
  units: 'units',
  coursewareMeta: 'coursewareMeta',
} as const;

export const views = {
  student: 'student_view',
  public: 'public_view',
} as const;

export const loadingState = 'loading';

export const messageTypes = {
  modal: 'plugin.modal',
  resize: 'plugin.resize',
  videoFullScreen: 'plugin.videoFullScreen',
  autoAdvance: 'plugin.autoAdvance',
  lazyReady: 'xblock.lazy.ready',
  lazyChildren: 'xblock.lazy.children',
} as const;

/** Max children per /api/courseware/v1/xblock_children/ request (matches LMS setting). */
export const LAZY_XBLOCK_BATCH_SIZE = 10;

/** Max parallel batch requests while loading shell children. */
export const LAZY_XBLOCK_MAX_PARALLEL = 3;

export default {
  modelKeys,
  views,
  loadingState,
  messageTypes,
};
