import { getConfig } from '@edx/frontend-platform';

export const iframeParams = {
  show_title: 0,
  show_bookmark: 0,
  recheck_access: 1,
};

interface Props {
  id: string;
  view: string;
  format?: string | null;
  examAccess: { blockAccess: boolean, accessToken?: string };
  jumpToId?: string;
  preview: boolean | string | number;
  /** When true, request LMS shell placeholders for large library quizzes (Phase B2). */
  renderModeShell?: boolean;
}

export const getIFrameUrl = ({
  id,
  view,
  format = null,
  examAccess,
  jumpToId,
  preview,
  renderModeShell = false,
}: Props) => {
  const xblockUrl = new URL(`${getConfig().LMS_BASE_URL}/xblock/${id}`);
  for (const [key, value] of Object.entries(iframeParams)) {
    xblockUrl.searchParams.set(key, String(value));
  }
  xblockUrl.searchParams.set('view', view);
  xblockUrl.searchParams.set('preview', String(preview));
  if (renderModeShell) {
    xblockUrl.searchParams.set('render_mode', 'shell');
  }
  if (format) {
    xblockUrl.searchParams.set('format', format);
  }
  if (!examAccess.blockAccess) {
    xblockUrl.searchParams.set('exam_access', examAccess.accessToken!);
  }
  // Pass jumpToId as query param as fragmentIdentifier is not passed to server.
  if (jumpToId) {
    xblockUrl.searchParams.set('jumpToId', jumpToId);
    xblockUrl.hash = `#${jumpToId}`; // this is used by browser to scroll to correct block.
  }
  xblockUrl.searchParams.sort();
  return xblockUrl.toString();
};

export default {
  getIFrameUrl,
};
