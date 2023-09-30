import axios, { AxiosResponse } from "axios";

const baseURL = `${import.meta.env["VITE_API_BASE_URL"]}/v1`;
const _ePaperC = localStorage.getItem("_ePaperC");
const axiosInstance = () =>
  axios.create({
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
  value?: string | number;
}

interface GetOptions {
  searchParameters: APISearchParam[];
  abortController: AbortController;
}

class APIAxiosConfig {
  private readonly _commonQuery: APISearchParam[];

  constructor() {
    const organizationId = localStorage.getItem("currentOrganization");
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
    try {
      const url = new URL(path, baseURL);
      const postURLSearchParams = url.searchParams;
      this.setAllSearchParameters(this._commonQuery, postURLSearchParams);
      this.setAllSearchParameters([...this._commonQuery], postURLSearchParams);
      console.log("POST: ", url);
      const postURL = url.pathname + url.search;
      const axiosResponse = await axiosInstance().post<
        TResponse,
        APIResponse<TResponse>,
        TPayload
      >(postURL, payload);
      if (axiosResponse.data.success) {
        return axiosResponse.data.data;
      }
    } catch (error: unknown) {
      this.ResponseErrorHandler(error);
    }
  }
  async APIPutRequestWrapper<TPayload, TResponse>(
    path: string,
    payload: TPayload,
  ) {
    try {
      const url = new URL(path, baseURL);
      const putURLSearchParams = url.searchParams;
      this.setAllSearchParameters(this._commonQuery, putURLSearchParams);
      this.setAllSearchParameters([...this._commonQuery], putURLSearchParams);
      console.log("PUT: ", url);
      const putURL = url.pathname + url.search;
      const axiosResponse = await axiosInstance().put<
        TResponse,
        APIResponse<TResponse>,
        TPayload
      >(putURL, payload);
      if (axiosResponse.data.success) {
        return axiosResponse.data.data;
      }
    } catch (error: unknown) {
      this.ResponseErrorHandler(error);
    }
  }

  async APIDeleteRequestWrapper<TResponse>(path: string) {
    try {
      const url = new URL(path, baseURL);
      const deleteURLSearchParams = url.searchParams;
      this.setAllSearchParameters(this._commonQuery, deleteURLSearchParams);
      this.setAllSearchParameters(
        [...this._commonQuery],
        deleteURLSearchParams,
      );
      console.log("DELETE: ", url);
      const deleteURL = url.pathname + url.search;
      const axiosResponse = await axiosInstance().delete<
        TResponse,
        APIResponse<TResponse>
      >(deleteURL);
      if (axiosResponse.data.success) {
        return true;
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
      console.log("GET:", url);
      const getURL = url.pathname + url.search;
      const axiosResponse = await axiosInstance().get<
        TResponse,
        APIResponse<TResponse>
      >(getURL);
      if (axiosResponse.data.success) {
        console.log("Got data from", url.toString());
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
      if (value?.value) {
        urlSearchParams.set(value.key, value.value.toString());
      }
    }
  }
}

export default new APIAxiosConfig();
