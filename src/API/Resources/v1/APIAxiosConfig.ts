import axios, { AxiosResponse } from "axios";

const baseURL = `${import.meta.env["VITE_API_BASE_URL"]}/v1`;
const _ePaperC = localStorage.getItem("_ePaperC");
const axiosInstance = ()=>  axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    Authorization: `Bearer ${_ePaperC}`,
  },
});

interface APIResponse<T> extends AxiosResponse {
  data: {
    success: boolean;
    code: number;
    data: T;
  };
}

interface APISearchParam {
  key: string;
  value: string | number;
}

interface GetOptions {
  searchParameters: APISearchParam[];
  abortController: AbortController;
}

class APIAxiosConfig {
  private readonly _commonQuery: APISearchParam[];

  constructor() {
    const organizationId = localStorage.getItem("organizationId");
    this._commonQuery = [
    ];
    if (organizationId) {
      this._commonQuery.push({
        key: "organization_id",
        value: organizationId,
      });
    }
  }

  async APIPostRequestWrapper<TPayload, TResponse>(
    url: string,
    payload: TPayload,
  ) {
    try {
      const postURL = new URL(url);
      const postURLSearchParams = postURL.searchParams;
      this.setAllSearchParameters(this._commonQuery, postURLSearchParams);
      const axiosResponse = await axiosInstance().post<
        TPayload,
        APIResponse<TResponse>
      >(url.toString(), payload);
      if (axiosResponse.data.success) {
        return axiosResponse.data.data;
      }
    } catch (error: unknown) {
      this.ResponseErrorHandler(error);
    }
  }

  async APIGetRequestWrapper<TResponse>(path: string, options?: GetOptions) {
    try {
      const url = new URL(path, baseURL);
      const postURLSearchParams = url.searchParams;
      const searchParametersFromOption = options?.searchParameters ?? [];
      this.setAllSearchParameters(
        [...this._commonQuery, ...searchParametersFromOption],
        postURLSearchParams,
      );
      console.log(url);
      const getURL = url.pathname + url.search;
      const axiosResponse = await axiosInstance().get<
        never,
        APIResponse<TResponse>,
        never
      >(getURL);
      if (axiosResponse.data.success) {
        return axiosResponse.data.data;
      }
    } catch (error: unknown) {
      this.ResponseErrorHandler(error);
    }
  }

  rawAxiosInstance() {
    return axiosInstance;
  }

  private ResponseErrorHandler(error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error("Axios error");
    } else {
      console.log(error);
      throw new Error("Unknown error");
    }
  }

  private setAllSearchParameters(
    parameterArray: APISearchParam[],
    urlSearchParams: URLSearchParams,
  ) {
    // loop over each key value of parameterArray and set it to urlSearchParams
    for (const [, value] of parameterArray.entries()) {
      urlSearchParams.set(value.key, value.value.toString());
    }
  }
}

export default new APIAxiosConfig();
