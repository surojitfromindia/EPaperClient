import axios, {AxiosResponse} from "axios";
const baseURL = `${import.meta.env["VITE_API_BASE_URL"]}/v1`;
const axiosInstance = axios.create({
    baseURL,
    withCredentials: true
});

interface APIResponse<T> extends AxiosResponse {
    data: {
        success: boolean,
        code: number,
        data: T
    }
}

interface APISearchParam {
    key: string,
    value: string | number
}

interface GetOptions {
    searchParameters: APISearchParam[]
}

class APIAxiosConfig {
    #commonQuery: APISearchParam[];

    constructor() {
        this.#commonQuery = [
            {
                key: "organization_id",
                value: 2
            }
        ]
    }

    async APIPostRequestWrapper<TPayload, TResponse>(url: string, payload: TPayload) {
        try {
            const postURL = new URL(url);
            const postURLSearchParams = postURL.searchParams;
            this.setAllSearchParameters(this.#commonQuery, postURLSearchParams)
            const axiosResponse = await axiosInstance.post<TPayload, APIResponse<TResponse>>(url.toString(), payload);
            if (axiosResponse.data.success) {
                return axiosResponse.data.data;
            }
        } catch (error: unknown) {
            this.ResponseErrorHandler(error)
        }
    }

    async APIGetRequestWrapper<TResponse>(path: string, options?: GetOptions) {
        try {
            const url = new URL(path,baseURL);
            const postURLSearchParams = url.searchParams;
            const searchParametersFromOption = options?.searchParameters ?? []
            this.setAllSearchParameters([...this.#commonQuery, ...searchParametersFromOption], postURLSearchParams)
            console.log(url)
            const getURL = url.pathname+url.search;
            const axiosResponse = await axiosInstance.get<never, APIResponse<TResponse>, never>(getURL);
            if (axiosResponse.data.success) {
                return axiosResponse.data.data;
            }
        } catch (error: unknown) {
            this.ResponseErrorHandler(error)
        }
    }

    rawAxiosInstance() {
        return axiosInstance;
    }

    ResponseErrorHandler(error: unknown) {
        if (axios.isAxiosError(error)) {
            throw new Error("Axios error")
        } else {
            console.log(error)
            throw new Error("Unknown error")
        }
    }


    setAllSearchParameters(parameterArray: APISearchParam[], urlSearchParams: URLSearchParams) {
        // loop over each key value of parameterArray and set it to urlSearchParams
        for (const [, value] of parameterArray.entries()) {
            urlSearchParams.set(value.key, value.value.toString())
        }
    }

}


export default new APIAxiosConfig();