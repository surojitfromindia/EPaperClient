import { APIService } from "@/API/Resources/v1/APIService.ts";
import APIAxiosConfig from "@/API/Resources/v1/APIAxiosConfig.ts";

type AutoCompleteBasicType = {
  id: number;
  text: string;
};
type AutoCompleteResultType<R> = R & AutoCompleteBasicType;
type AutoCompleteServiceReturnType<R> = {
  results: AutoCompleteResultType<R>[];
  page_context: {
    limit: number;
    skip: number;
  };
};

type ContactAutoCompleteType = {
  contact_name: string;
};

class AutoCompleteService implements APIService {
  readonly urlFragment: string = "/auto_complete";
  #axiosConfig: typeof APIAxiosConfig;
  private readonly abortController: AbortController;

  constructor() {
    this.#axiosConfig = APIAxiosConfig;
    this.abortController = new AbortController();
  }

  getContacts({ search_text, contact_type }) {
    const url = this.urlFragment+"/contact";
    return this.#axiosConfig.APIGetRequestWrapper<
      AutoCompleteServiceReturnType<ContactAutoCompleteType>
    >(url, {
      searchParameters: [
        {
          key: "search_text",
          value: search_text,
        },
        {
          key: "contact_type",
          value: contact_type,
        },
      ],
      abortController: this.abortController,
    });
  }

  abortGetRequest(): void {
    this.abortController.abort();
  }
}
export default AutoCompleteService;
