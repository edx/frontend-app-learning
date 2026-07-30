import { getConfig, setConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import MockAdapter from 'axios-mock-adapter';
import {
  getTimeOffsetMillis, getExamsData, getTrackSelectionTabData, resolveLmsRedirectUrl,
} from './api';
import { initializeMockApp } from '../../setupTest';

initializeMockApp();

const axiosMock = new MockAdapter(getAuthenticatedHttpClient());

describe('Calculate the time offset properly', () => {
  it('Should return 0 if the headerDate is not set', async () => {
    const offset = getTimeOffsetMillis(undefined, undefined, undefined);
    expect(offset).toBe(0);
  });

  it('Should return the offset', async () => {
    const headerDate = '2021-04-13T11:01:58.135Z';
    const requestTime = new Date('2021-04-12T11:01:57.135Z');
    const responseTime = new Date('2021-04-12T11:01:58.635Z');
    const offset = getTimeOffsetMillis(headerDate, requestTime, responseTime);
    expect(offset).toBe(86398750);
  });
});

describe('getExamsData', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const sequenceId = 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@12345';
  let originalConfig;

  beforeEach(() => {
    axiosMock.reset();
    originalConfig = getConfig();
  });

  afterEach(() => {
    axiosMock.reset();
    if (originalConfig) {
      setConfig(originalConfig);
    }
  });

  it('should use LMS URL when EXAMS_BASE_URL is not configured', async () => {
    setConfig({
      ...originalConfig,
      EXAMS_BASE_URL: undefined,
      LMS_BASE_URL: 'http://localhost:18000',
    });

    const mockExamData = {
      exam: {
        id: 1,
        course_id: courseId,
        content_id: sequenceId,
        exam_name: 'Test Exam',
        attempt_status: 'created',
      },
    };

    const expectedUrl = `http://localhost:18000/api/edx_proctoring/v1/proctored_exam/attempt/course_id/${encodeURIComponent(courseId)}?is_learning_mfe=true&content_id=${encodeURIComponent(sequenceId)}`;
    axiosMock.onGet(expectedUrl).reply(200, mockExamData);

    const result = await getExamsData(courseId, sequenceId);

    expect(result).toEqual({
      exam: {
        id: 1,
        courseId,
        contentId: sequenceId,
        examName: 'Test Exam',
        attemptStatus: 'created',
      },
    });
    expect(axiosMock.history.get).toHaveLength(1);
    expect(axiosMock.history.get[0].url).toBe(expectedUrl);
  });

  it('should use EXAMS_BASE_URL when configured', async () => {
    setConfig({
      ...originalConfig,
      EXAMS_BASE_URL: 'http://localhost:18740',
      LMS_BASE_URL: 'http://localhost:18000',
    });

    const mockExamData = {
      exam: {
        id: 1,
        course_id: courseId,
        content_id: sequenceId,
        exam_name: 'Test Exam',
        attempt_status: 'submitted',
      },
    };

    const expectedUrl = `http://localhost:18740/api/v1/student/exam/attempt/course_id/${encodeURIComponent(courseId)}/content_id/${encodeURIComponent(sequenceId)}`;
    axiosMock.onGet(expectedUrl).reply(200, mockExamData);

    const result = await getExamsData(courseId, sequenceId);

    expect(result).toEqual({
      exam: {
        id: 1,
        courseId,
        contentId: sequenceId,
        examName: 'Test Exam',
        attemptStatus: 'submitted',
      },
    });
    expect(axiosMock.history.get).toHaveLength(1);
    expect(axiosMock.history.get[0].url).toBe(expectedUrl);
  });

  it('should return empty object when API returns 404', async () => {
    setConfig({
      ...originalConfig,
      EXAMS_BASE_URL: undefined,
      LMS_BASE_URL: 'http://localhost:18000',
    });

    const expectedUrl = `http://localhost:18000/api/edx_proctoring/v1/proctored_exam/attempt/course_id/${encodeURIComponent(courseId)}?is_learning_mfe=true&content_id=${encodeURIComponent(sequenceId)}`;

    // Mock a 404 error with the custom error response function to add customAttributes
    axiosMock.onGet(expectedUrl).reply(() => {
      const error = new Error('Request failed with status code 404');
      error.response = { status: 404, data: {} };
      error.customAttributes = { httpErrorStatus: 404 };
      return Promise.reject(error);
    });

    const result = await getExamsData(courseId, sequenceId);

    expect(result).toEqual({});
    expect(axiosMock.history.get).toHaveLength(1);
  });

  it('should throw error for non-404 HTTP errors', async () => {
    setConfig({
      ...originalConfig,
      EXAMS_BASE_URL: undefined,
      LMS_BASE_URL: 'http://localhost:18000',
    });

    const expectedUrl = `http://localhost:18000/api/edx_proctoring/v1/proctored_exam/attempt/course_id/${encodeURIComponent(courseId)}?is_learning_mfe=true&content_id=${encodeURIComponent(sequenceId)}`;

    // Mock a 500 error with custom error response
    axiosMock.onGet(expectedUrl).reply(() => {
      const error = new Error('Request failed with status code 500');
      error.response = { status: 500, data: { error: 'Server Error' } };
      error.customAttributes = { httpErrorStatus: 500 };
      return Promise.reject(error);
    });

    await expect(getExamsData(courseId, sequenceId)).rejects.toThrow();
    expect(axiosMock.history.get).toHaveLength(1);
  });

  it('should properly encode URL parameters', async () => {
    setConfig({
      ...originalConfig,
      EXAMS_BASE_URL: 'http://localhost:18740',
      LMS_BASE_URL: 'http://localhost:18000',
    });

    const specialCourseId = 'course-v1:edX+Demo X+Demo Course';
    const specialSequenceId = 'block-v1:edX+Demo X+Demo Course+type@sequential+block@test sequence';

    const mockExamData = { exam: { id: 1 } };
    const expectedUrl = `http://localhost:18740/api/v1/student/exam/attempt/course_id/${encodeURIComponent(specialCourseId)}/content_id/${encodeURIComponent(specialSequenceId)}`;
    axiosMock.onGet(expectedUrl).reply(200, mockExamData);

    await getExamsData(specialCourseId, specialSequenceId);

    expect(axiosMock.history.get[0].url).toBe(expectedUrl);
    expect(axiosMock.history.get[0].url).toContain('course-v1%3AedX%2BDemo%20X%2BDemo%20Course');
    expect(axiosMock.history.get[0].url).toContain('block-v1%3AedX%2BDemo%20X%2BDemo%20Course%2Btype%40sequential%2Bblock%40test%20sequence');
  });
});

describe('resolveLmsRedirectUrl', () => {
  let originalConfig;

  beforeEach(() => {
    originalConfig = getConfig();
  });

  afterEach(() => {
    if (originalConfig) {
      setConfig(originalConfig);
    }
  });

  it('returns falsy values unchanged', () => {
    expect(resolveLmsRedirectUrl(null)).toBeNull();
    expect(resolveLmsRedirectUrl(undefined)).toBeUndefined();
    expect(resolveLmsRedirectUrl('')).toBe('');
  });

  it('returns absolute URLs unchanged', () => {
    expect(resolveLmsRedirectUrl('https://example.com/dashboard')).toBe('https://example.com/dashboard');
    expect(resolveLmsRedirectUrl('http://example.com/dashboard')).toBe('http://example.com/dashboard');
  });

  it('resolves site-relative paths against LMS_BASE_URL', () => {
    setConfig({ ...originalConfig, LMS_BASE_URL: 'http://localhost:18000/' });
    expect(resolveLmsRedirectUrl('/dashboard')).toBe('http://localhost:18000/dashboard');
  });

  it('resolves paths without a leading slash against LMS_BASE_URL', () => {
    setConfig({ ...originalConfig, LMS_BASE_URL: 'http://localhost:18000' });
    expect(resolveLmsRedirectUrl('dashboard')).toBe('http://localhost:18000/dashboard');
  });
});

describe('getTrackSelectionTabData', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  let originalConfig;
  let replaceMock;

  const mockLocationReplace = () => {
    replaceMock = jest.fn();
    Object.defineProperty(window, 'location', {
      writable: true,
      configurable: true,
      value: { replace: replaceMock, href: '' },
    });
    return replaceMock;
  };

  beforeEach(() => {
    axiosMock.reset();
    originalConfig = getConfig();
    mockLocationReplace();
    setConfig({
      ...originalConfig,
      LMS_BASE_URL: 'http://localhost:18000',
    });
  });

  afterEach(() => {
    axiosMock.reset();
    if (originalConfig) {
      setConfig(originalConfig);
    }
  });

  it('returns camelCased data when the API succeeds', async () => {
    const trackSelectionUrl = `http://localhost:18000/api/course_modes/v1/track_selection/${courseId}`;
    const apiData = {
      course_id: courseId,
      course_name: 'Demo Course',
      course_modes_choose_url: '/course_modes/choose/demo/',
      verified_mode: { min_price: '100', currency: 'usd' },
    };
    axiosMock.onGet(trackSelectionUrl).reply(200, apiData);

    const result = await getTrackSelectionTabData(courseId);

    expect(result).toEqual({
      courseId,
      courseName: 'Demo Course',
      courseModesChooseUrl: '/course_modes/choose/demo/',
      verifiedMode: { minPrice: '100', currency: 'usd' },
    });
  });

  it('redirects and returns pending marker when API includes redirect_url', async () => {
    const trackSelectionUrl = `http://localhost:18000/api/course_modes/v1/track_selection/${courseId}`;
    axiosMock.onGet(trackSelectionUrl).reply(200, { redirect_url: '/dashboard' });

    const result = await getTrackSelectionTabData(courseId);

    expect(replaceMock).toHaveBeenCalledWith('http://localhost:18000/dashboard');
    expect(result).toEqual({ trackSelectionRedirect: true });
  });

  it('redirects to legacy choose page on 404', async () => {
    const trackSelectionUrl = `http://localhost:18000/api/course_modes/v1/track_selection/${courseId}`;
    axiosMock.onGet(trackSelectionUrl).reply(404);

    const result = await getTrackSelectionTabData(courseId);

    expect(replaceMock).toHaveBeenCalledWith(
      `http://localhost:18000/course_modes/choose/${courseId}/`,
    );
    expect(result).toEqual({ trackSelectionRedirect: true });
  });

  it('throws for non-404 HTTP errors', async () => {
    const trackSelectionUrl = `http://localhost:18000/api/course_modes/v1/track_selection/${courseId}`;
    axiosMock.onGet(trackSelectionUrl).reply(500);

    await expect(getTrackSelectionTabData(courseId)).rejects.toThrow();
  });
});
