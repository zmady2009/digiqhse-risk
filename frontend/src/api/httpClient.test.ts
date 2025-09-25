import MockAdapter from 'axios-mock-adapter';
import { afterEach, describe, expect, it } from 'vitest';

import { ApiError, httpClient, setApiKeyAccessor, type ProblemDetails } from './httpClient';

const mock = new MockAdapter(httpClient);

afterEach(() => {
  mock.reset();
  setApiKeyAccessor(() => null);
});

describe('httpClient', () => {
  it('injects the DOLAPIKEY header when api key is available', async () => {
    setApiKeyAccessor(() => 'abc123');

    mock.onGet('/risks').reply((config) => {
      expect(config.headers?.DOLAPIKEY).toBe('abc123');
      return [200, { data: [], meta: { page: 1, size: 25, totalItems: 0, totalPages: 0 } }];
    });

    await httpClient.get('/risks');
  });

  it('maps API problem details into ApiError instances', async () => {
    const problem: ProblemDetails = {
      type: 'https://example.com/problem/conflict',
      title: 'Conflict',
      status: 409,
      detail: 'Already exists'
    };

    mock.onGet('/risks/1').reply(409, problem, { 'content-type': 'application/problem+json' });

    await expect(httpClient.get('/risks/1')).rejects.toMatchObject<ApiError>({
      status: 409,
      problem
    });
  });
});
