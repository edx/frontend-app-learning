import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import MockAdapter from 'axios-mock-adapter';
import { act, renderHook, waitFor } from '@testing-library/react';
import { logError } from '@edx/frontend-platform/logging';

import { initializeMockApp } from '../../../../../setupTest';
import useLazyXBlockLoad, { chunkArray, mapWithConcurrency } from './useLazyXBlockLoad';
import { messageTypes } from '../constants';

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

describe('useLazyXBlockLoad helpers', () => {
  test('chunkArray splits into sized batches', () => {
    expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  test('mapWithConcurrency respects order and concurrency', async () => {
    const seen = [];
    const results = await mapWithConcurrency([10, 20, 30], 2, async (value) => {
      seen.push(value);
      return value * 2;
    });
    expect(results).toEqual([20, 40, 60]);
    expect(seen).toHaveLength(3);
  });
});

describe('useLazyXBlockLoad', () => {
  let axiosMock;
  let postMessageMock;
  let iframeContentWindow;
  const lmsBase = 'https://lms.test';
  const lmsOrigin = 'https://lms.test';

  const dispatchLazyReady = (overrides = {}) => {
    window.dispatchEvent(new MessageEvent('message', {
      data: {
        type: messageTypes.lazyReady,
        parent_usage_key: 'block-v1:parent',
        child_usage_keys: ['block-v1:c1'],
      },
      origin: lmsOrigin,
      source: iframeContentWindow,
      ...overrides,
    }));
  };

  beforeAll(async () => {
    await initializeMockApp();
  });

  beforeEach(() => {
    getConfig().LMS_BASE_URL = lmsBase;
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    postMessageMock = jest.fn();
    iframeContentWindow = { postMessage: postMessageMock };
    document.body.innerHTML = '<iframe id="unit-iframe"></iframe>';
    Object.defineProperty(document.getElementById('unit-iframe'), 'contentWindow', {
      value: iframeContentWindow,
      configurable: true,
    });
  });

  afterEach(() => {
    axiosMock.restore();
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  test('ignores messages when disabled', async () => {
    const { result } = renderHook(() => useLazyXBlockLoad({
      elementId: 'unit-iframe',
      enabled: false,
    }));

    act(() => {
      dispatchLazyReady();
    });

    expect(result.current.progress.active).toBe(false);
    expect(axiosMock.history.get).toHaveLength(0);
  });

  test('ignores messages from an unexpected origin', async () => {
    const { result } = renderHook(() => useLazyXBlockLoad({
      elementId: 'unit-iframe',
      enabled: true,
    }));

    act(() => {
      dispatchLazyReady({ origin: 'https://evil.example' });
    });

    expect(result.current.progress.active).toBe(false);
    expect(axiosMock.history.get).toHaveLength(0);
  });

  test('ignores messages that are not from the unit iframe', async () => {
    const { result } = renderHook(() => useLazyXBlockLoad({
      elementId: 'unit-iframe',
      enabled: true,
    }));

    act(() => {
      dispatchLazyReady({ source: window });
    });

    expect(result.current.progress.active).toBe(false);
    expect(axiosMock.history.get).toHaveLength(0);
  });

  test('accepts messages when LMS_BASE_URL includes a path (compares origin only)', async () => {
    getConfig().LMS_BASE_URL = `${lmsBase}/campus`;
    axiosMock.onGet(/xblock_children/).reply(200, {
      parent_usage_key: 'block-v1:parent',
      results: [{ usage_key: 'block-v1:c1', html: '<div>Q1</div>', resources: [] }],
      errors: [],
    });

    const { result } = renderHook(() => useLazyXBlockLoad({
      elementId: 'unit-iframe',
      enabled: true,
    }));

    act(() => {
      dispatchLazyReady();
    });

    await waitFor(() => {
      expect(result.current.progress.loaded).toBe(1);
      expect(result.current.progress.active).toBe(false);
    });

    expect(axiosMock.history.get).toHaveLength(1);
    expect(postMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: messageTypes.lazyChildren }),
      lmsOrigin,
    );
  });

  test('fetches children and posts results into the iframe', async () => {
    axiosMock.onGet(/xblock_children/).reply(200, {
      parent_usage_key: 'block-v1:parent',
      results: [{ usage_key: 'block-v1:c1', html: '<div>Q1</div>', resources: [] }],
      errors: [],
    });

    const { result } = renderHook(() => useLazyXBlockLoad({
      elementId: 'unit-iframe',
      enabled: true,
    }));

    act(() => {
      dispatchLazyReady();
    });

    await waitFor(() => {
      expect(result.current.progress.loaded).toBe(1);
      expect(result.current.progress.active).toBe(false);
    });

    expect(axiosMock.history.get).toHaveLength(1);
    expect(postMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: messageTypes.lazyChildren,
        parent_usage_key: 'block-v1:parent',
        results: [{ usage_key: 'block-v1:c1', html: '<div>Q1</div>', resources: [] }],
      }),
      lmsBase,
    );
  });

  test('sets error progress when batch API fails', async () => {
    axiosMock.onGet(/xblock_children/).reply(500);

    const { result } = renderHook(() => useLazyXBlockLoad({
      elementId: 'unit-iframe',
      enabled: true,
    }));

    act(() => {
      dispatchLazyReady();
    });

    await waitFor(() => {
      expect(result.current.progress.active).toBe(false);
      expect(result.current.progress.error).toBeTruthy();
    });

    expect(logError).toHaveBeenCalled();
    expect(postMessageMock).not.toHaveBeenCalled();
  });

  test('surfaces partial child errors while still posting successful results', async () => {
    axiosMock.onGet(/xblock_children/).reply(200, {
      parent_usage_key: 'block-v1:parent',
      results: [{ usage_key: 'block-v1:c1', html: '<div>Q1</div>', resources: [] }],
      errors: [{ usage_key: 'block-v1:c2', error: 'forbidden', message: 'not selected' }],
    });

    const { result } = renderHook(() => useLazyXBlockLoad({
      elementId: 'unit-iframe',
      enabled: true,
    }));

    act(() => {
      dispatchLazyReady({
        data: {
          type: messageTypes.lazyReady,
          parent_usage_key: 'block-v1:parent',
          child_usage_keys: ['block-v1:c1', 'block-v1:c2'],
        },
      });
    });

    await waitFor(() => {
      expect(result.current.progress.active).toBe(false);
      expect(result.current.progress.error).toBe('partial_load_failed');
      expect(result.current.progress.loaded).toBe(1);
      expect(result.current.progress.total).toBe(2);
    });

    expect(postMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: messageTypes.lazyChildren,
        parent_usage_key: 'block-v1:parent',
        results: [{ usage_key: 'block-v1:c1', html: '<div>Q1</div>', resources: [] }],
      }),
      lmsBase,
    );
    expect(logError).toHaveBeenCalled();
  });

  test('continues later batches after a batch reports partial errors', async () => {
    const children = Array.from({ length: 11 }, (_, i) => `block-v1:c${i + 1}`);
    axiosMock.onGet(/xblock_children/).reply((config) => {
      const keysParam = new URL(config.url).searchParams.get('child_usage_keys') || '';
      const keys = keysParam.split(',').filter(Boolean);
      if (keys.length > 1) {
        return [200, {
          parent_usage_key: 'block-v1:parent',
          results: keys.slice(0, -1).map((usageKey) => ({
            usage_key: usageKey,
            html: `<div>${usageKey}</div>`,
            resources: [],
          })),
          errors: [{
            usage_key: keys[keys.length - 1],
            error: 'forbidden',
            message: 'not selected',
          }],
        }];
      }
      return [200, {
        parent_usage_key: 'block-v1:parent',
        results: keys.map((usageKey) => ({
          usage_key: usageKey,
          html: `<div>${usageKey}</div>`,
          resources: [],
        })),
        errors: [],
      }];
    });

    const { result } = renderHook(() => useLazyXBlockLoad({
      elementId: 'unit-iframe',
      enabled: true,
    }));

    act(() => {
      dispatchLazyReady({
        data: {
          type: messageTypes.lazyReady,
          parent_usage_key: 'block-v1:parent',
          child_usage_keys: children,
        },
      });
    });

    await waitFor(() => {
      expect(result.current.progress.active).toBe(false);
      expect(result.current.progress.error).toBe('partial_load_failed');
      // 9 successes from first batch + 1 from second batch
      expect(result.current.progress.loaded).toBe(10);
      expect(result.current.progress.total).toBe(11);
    });

    expect(axiosMock.history.get).toHaveLength(2);
    expect(postMessageMock).toHaveBeenCalledTimes(2);
    expect(logError).toHaveBeenCalled();
  });
});
