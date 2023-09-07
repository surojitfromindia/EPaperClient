import APIAxiosConfig from "@/API/Resources/v1/APIAxiosConfig.ts";
import { APIService } from "@/API/Resources/v1/APIService.ts";

type AppStateResponse = {
  name: string;
  primary_address: string;
  organization_id: number;
  currency_code: string;
  sector: string;
  country_code: string;
};

class AppStateService implements APIService {
  readonly urlFragment = "/app_state";
  #axiosConfig: typeof APIAxiosConfig;
  private readonly abortController: AbortController;

  constructor() {
    this.#axiosConfig = APIAxiosConfig;
    this.abortController = new AbortController();
  }

  getAppState() {
    const url = this.fullEndPoint("");
    return this.#axiosConfig.APIGetRequestWrapper<{
      app_state: AppStateResponse;
    }>(url, {
      searchParameters: [],
      abortController: this.abortController,
    });
  }

  abortGetRequest(): void {
    this.abortController.abort();
  }

  fullEndPoint(url: string) {
    return `${this.urlFragment}${url}`;
  }
}

export default AppStateService;
export type { AppStateResponse };
