import axios, { AxiosResponse } from "axios";
import {LocalStorageAccess} from "@/util/LocalStorageAccess.ts";
import {ValidityUtil} from "@/util/ValidityUtil.ts";

const baseURL = `${import.meta.env["VITE_API_BASE_URL"]}/v1`;
const axiosInstance = () => {
  const _ePaperC = localStorage.getItem("_ePaperC");
  return axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${_ePaperC}`,
    },
  });
};

interface APIResponse<T> extends AxiosResponse {
  data: {
    success: boolean;
    code: number;
    data: T;
  };
}

interface APIError {
  success: boolean;
  code: number;
  message: string;
  errors: {
    message: string;
  }[];
}

interface APISearchParam {
  key: string;
  value?: string | number;
}

interface GetOptions {
  searchParameters: APISearchParam[];
  abortController: AbortController;
}

class APIAxiosConfig {
  private readonly _commonQuery: APISearchParam[];

  constructor() {
    const organizationId = LocalStorageAccess.getOrganizationId();
    this._commonQuery = [];
    if (organizationId) {
      this._commonQuery.push({
        key: "organization_id",
        value: organizationId,
      });
    }
  }

  async APIPostRequestWrapper<TPayload, TResponse>(
    path: string,
    payload: TPayload,
  ) {
    const url = new URL(path, baseURL);
    const postURLSearchParams = url.searchParams;
    this.setAllSearchParameters(this._commonQuery, postURLSearchParams);
    this.setAllSearchParameters([...this._commonQuery], postURLSearchParams);
    const postURL = url.pathname + url.search;
    const axiosResponse = await axiosInstance()
      .post<TResponse, APIResponse<TResponse>, TPayload>(postURL, payload)
      .catch((error) => {
        this.ResponseErrorHandler(error);
        return;
      });

    if (axiosResponse && axiosResponse.data.success) {
      return axiosResponse.data.data;
    }
  }
  async APIPutRequestWrapper<TPayload, TResponse>(
    path: string,
    payload: TPayload,
  ) {
    const url = new URL(path, baseURL);
    const putURLSearchParams = url.searchParams;
    this.setAllSearchParameters(this._commonQuery, putURLSearchParams);
    this.setAllSearchParameters([...this._commonQuery], putURLSearchParams);
    const putURL = url.pathname + url.search;
    const axiosResponse = await axiosInstance()
      .put<TResponse, APIResponse<TResponse>, TPayload>(putURL, payload)
      .catch((error) => {
        this.ResponseErrorHandler(error);
        return;
      });

    if (axiosResponse && axiosResponse.data.success) {
      return axiosResponse.data.data;
    }
  }

  async APIDeleteRequestWrapper<TResponse>(path: string) {
    const url = new URL(path, baseURL);
    const deleteURLSearchParams = url.searchParams;
    this.setAllSearchParameters(this._commonQuery, deleteURLSearchParams);
    this.setAllSearchParameters([...this._commonQuery], deleteURLSearchParams);
    const deleteURL = url.pathname + url.search;
    const axiosResponse = await axiosInstance()
      .delete<TResponse, APIResponse<TResponse>>(deleteURL)
      .catch((error) => {
        this.ResponseErrorHandler(error);
        return;
      });

    if (axiosResponse && axiosResponse.data.success) {
      return axiosResponse.data.data;
    }
  }

  async APIGetRequestWrapper<TResponse>(path: string, options?: GetOptions) {
    const url = new URL(path, baseURL);
    const postURLSearchParams = url.searchParams;
    const searchParametersFromOption = options?.searchParameters ?? [];
    this.setAllSearchParameters(
      [...this._commonQuery, ...searchParametersFromOption],
      postURLSearchParams,
    );
    const getURL = url.pathname + url.search;
    const axiosResponse = await axiosInstance()
      .get<TResponse, APIResponse<TResponse>>(getURL)
      .catch((error) => {
        this.ResponseErrorHandler(error);
        return;
      });
    if (axiosResponse && axiosResponse.data.success) {
      return axiosResponse.data.data;
    }
  }

  rawAxiosInstance() {
    return axiosInstance;
  }

  private ResponseErrorHandler(error: unknown) {
    throw new WrappedError(error);
  }

  private setAllSearchParameters(
    parameterArray: APISearchParam[],
    urlSearchParams: URLSearchParams,
  ) {
    // loop over each key value of parameterArray and set it to urlSearchParams
    for (const [, value] of parameterArray.entries()) {
      if (ValidityUtil.isNotEmpty(value?.value)) {
        urlSearchParams.set(value.key, value.value.toString());
      }
    }
  }
}

export default new APIAxiosConfig();

class WrappedError extends Error {
  private readonly errors: { message: string }[];
  private readonly messageText: string;
  constructor(apiError: unknown) {
    let messageText: string = "";
    if (axios.isAxiosError<APIError>(apiError)) {
      const response = apiError.response;
      const errorCode = response?.status;
      if (errorCode === 401) {
        messageText = "Unauthorized";
      } else if (errorCode === 403) {
        messageText = "Forbidden";
      } else if (errorCode === 404) {
        messageText = response.data.message ?? "Not Found";
      } else if (errorCode === 500) {
        messageText = "Internal Server Error";
      } else {
        messageText = "Something went wrong";
      }
      super(messageText);
      this.messageText = messageText;
      this.errors = response?.data?.errors ?? [];
    } else {
      super("Something went wrong");
      this.errors = [];
      this.messageText = "Something went wrong";
    }
  }
  get message() {
    return this.messageText;
  }
  get messages() {
    return this.errors.map((error) => error.message);
  }
}
export { WrappedError };
