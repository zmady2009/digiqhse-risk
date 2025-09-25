import axios, { AxiosError, AxiosInstance } from 'axios';

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  traceId?: string;
  [key: string]: unknown;
}

export class ApiError<T = unknown> extends Error {
  public readonly status: number;
  public readonly problem?: ProblemDetails;
  public readonly causeData?: T;

  constructor(message: string, status: number, problem?: ProblemDetails, causeData?: T) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.problem = problem;
    this.causeData = causeData;
  }
}

type ApiKeyAccessor = () => string | null;

let apiKeyAccessor: ApiKeyAccessor = () => null;

export const setApiKeyAccessor = (accessor: ApiKeyAccessor) => {
  apiKeyAccessor = accessor;
};

const createHttpClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
      Accept: 'application/json'
    },
    withCredentials: false
  });

  instance.interceptors.request.use((config) => {
    const apiKey = apiKeyAccessor();
    if (apiKey) {
      config.headers = config.headers ?? {};
      config.headers.DOLAPIKEY = apiKey;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ProblemDetails>) => {
      if (error.response) {
        const problem = error.response.data;
        const apiError = new ApiError(
          problem?.title ?? error.message,
          error.response.status,
          problem,
          error.response.data
        );
        return Promise.reject(apiError);
      }

      if (error.request) {
        const networkError = new ApiError(error.message, 0);
        return Promise.reject(networkError);
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export const httpClient = createHttpClient();
