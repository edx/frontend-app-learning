import { getConfig } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';
import React from 'react';

import { useEventListener } from '@src/generic/hooks';
import { getXBlockChildren } from '@src/courseware/data/api';
import {
  LAZY_XBLOCK_BATCH_SIZE,
  LAZY_XBLOCK_MAX_PARALLEL,
  messageTypes,
} from '../constants';

/**
 * Chunk an array into pieces of at most `size`.
 * @template T
 * @param {T[]} items
 * @param {number} size
 * @returns {T[][]}
 */
export function chunkArray(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/**
 * Run async work over items with a concurrency limit.
 * @template T, R
 * @param {T[]} items
 * @param {number} concurrency
 * @param {(item: T, index: number) => Promise<R>} worker
 * @returns {Promise<R[]>}
 */
export async function mapWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const current = nextIndex;
      nextIndex += 1;
      // eslint-disable-next-line no-await-in-loop
      results[current] = await worker(items[current], current);
    }
  }

  const poolSize = Math.max(1, Math.min(concurrency, items.length || 1));
  await Promise.all(Array.from({ length: poolSize }, () => runWorker()));
  return results;
}

/**
 * Resolve LMS origin from config (scheme + host only; ignore path).
 * @returns {string|null}
 */
export function getLmsOrigin() {
  try {
    return new URL(getConfig().LMS_BASE_URL).origin;
  } catch (error) {
    return null;
  }
}

/**
 * Orchestrates shell → batch child loading for large library quizzes.
 *
 * Listens for `xblock.lazy.ready` from the unit iframe, fetches children via
 * `/api/courseware/v1/xblock_children/`, and posts `xblock.lazy.children` back
 * into the iframe for placeholder fill + resize.
 */
const useLazyXBlockLoad = ({
  elementId,
  enabled,
}) => {
  const [progress, setProgress] = React.useState({
    active: false,
    loaded: 0,
    total: 0,
    error: null,
  });

  const postChildrenToIframe = React.useCallback((parentUsageKey, results) => {
    const iframe = document.getElementById(elementId);
    const targetOrigin = getLmsOrigin();
    if (!iframe?.contentWindow || !targetOrigin) {
      return;
    }
    iframe.contentWindow.postMessage({
      type: messageTypes.lazyChildren,
      parent_usage_key: parentUsageKey,
      results,
    }, targetOrigin);
  }, [elementId]);

  const loadChildren = React.useCallback(async (parentUsageKey, childUsageKeys) => {
    const keys = childUsageKeys || [];
    setProgress({
      active: true,
      loaded: 0,
      total: keys.length,
      error: null,
    });

    if (!keys.length) {
      setProgress({
        active: false,
        loaded: 0,
        total: 0,
        error: null,
      });
      return;
    }

    const batches = chunkArray(keys, LAZY_XBLOCK_BATCH_SIZE);
    let loaded = 0;
    const partialErrors = [];

    try {
      await mapWithConcurrency(batches, LAZY_XBLOCK_MAX_PARALLEL, async (batch) => {
        const response = await getXBlockChildren(parentUsageKey, batch);
        const results = (response.results || []).map((item) => ({
          usage_key: item.usageKey || item.usage_key,
          html: item.html,
          // The shell page rendered no children, so it has none of their JS/CSS.
          // Forward each child's fragment resources so the iframe can load them
          // before initializing the block.
          resources: item.resources || [],
        }));
        const batchErrors = response.errors || [];
        if (batchErrors.length) {
          partialErrors.push(...batchErrors);
        }
        postChildrenToIframe(parentUsageKey, results);
        loaded += results.length;
        setProgress((prev) => ({
          ...prev,
          loaded: Math.min(prev.total, loaded),
          active: true,
          // Surface partial failures immediately; remaining batches still run.
          error: partialErrors.length ? 'partial_load_failed' : prev.error,
        }));
        return response;
      });
      if (partialErrors.length) {
        logError(new Error('Partial failures loading xblock children'), {
          message: 'Some xblock children failed to load for shell unit',
          parentUsageKey,
          errorCount: partialErrors.length,
          errors: partialErrors,
        });
      }
      setProgress((prev) => ({
        ...prev,
        loaded: Math.min(prev.total, loaded),
        active: false,
        error: partialErrors.length ? 'partial_load_failed' : null,
      }));
    } catch (error) {
      logError(error, {
        message: 'Failed to batch-load xblock children for shell unit',
        parentUsageKey,
      });
      setProgress((prev) => ({
        ...prev,
        active: false,
        error: error?.message || 'lazy_load_failed',
      }));
    }
  }, [postChildrenToIframe]);

  const receiveMessage = React.useCallback((event) => {
    const { data, origin, source } = event;
    if (!enabled || !data || data.type !== messageTypes.lazyReady) {
      return;
    }

    // Only accept messages from the LMS origin (not a full base URL path) and
    // from this unit iframe's contentWindow — other page scripts must not
    // trigger authenticated batch loads or progress UI updates.
    const expectedOrigin = getLmsOrigin();
    if (!expectedOrigin || origin !== expectedOrigin) {
      return;
    }

    const iframe = document.getElementById(elementId);
    if (!iframe?.contentWindow || source !== iframe.contentWindow) {
      return;
    }

    const parentUsageKey = data.parent_usage_key || data.parentUsageKey;
    const childUsageKeys = data.child_usage_keys || data.childUsageKeys || [];
    if (!parentUsageKey) {
      return;
    }
    loadChildren(parentUsageKey, childUsageKeys);
  }, [enabled, elementId, loadChildren]);

  useEventListener('message', receiveMessage);

  React.useEffect(() => {
    if (!enabled) {
      setProgress({
        active: false,
        loaded: 0,
        total: 0,
        error: null,
      });
    }
  }, [enabled, elementId]);

  return { progress };
};

export default useLazyXBlockLoad;
