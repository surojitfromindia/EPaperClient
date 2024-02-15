import APIAxiosConfig from "@/API/Resources/v1/APIAxiosConfig.ts";
import { CustomView } from "@/API/Resources/v1/CustomView/CustomView";

class CustomViewService {
  readonly urlFragment: string = "/custom_views";
  #axiosConfig: typeof APIAxiosConfig;
  private readonly abortController: AbortController;

  constructor() {
    this.#axiosConfig = APIAxiosConfig;
    this.abortController = new AbortController();
  }

  getFullCustomView() {
    const url = this.urlFragment;
    return this.#axiosConfig.APIGetRequestWrapper<{
      custom_view: CustomView;
    }>(url, {
      searchParameters: [],
      abortController: this.abortController,
    });
  }

  getCustomViewForEntity({ entity }: { entity: "invoice" | "customer" }) {
    const url = `${this.urlFragment}/entity/${entity}`;
    return this.#axiosConfig.APIGetRequestWrapper<{
      custom_view: CustomView;
    }>(url, {
      searchParameters: [],
      abortController: this.abortController,
    });
  }
}

export { CustomViewService };