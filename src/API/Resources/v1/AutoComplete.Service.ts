import { APIService } from "@/API/Resources/v1/APIService.ts";
import APIAxiosConfig from "@/API/Resources/v1/APIAxiosConfig.ts";
import { ContactType } from "@/API/Resources/v1/Contact/Contact";
import { ItemFor } from "@/API/Resources/v1/Item/Item.Service.ts";

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
type ItemAutoCompleteType = {
  name: string;
  selling_price: number;
  purchase_price: number;
};

class AutoCompleteService implements APIService {
  readonly urlFragment: string = "/auto_complete";
  #axiosConfig: typeof APIAxiosConfig;
  private readonly abortController: AbortController;

  constructor() {
    this.#axiosConfig = APIAxiosConfig;
    this.abortController = new AbortController();
  }

  getContacts({
    search_text,
    contact_type,
  }: {
    search_text: string;
    contact_type: ContactType;
  }) {
    const url = this.urlFragment + "/contact";
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
  getItems({
    search_text,
    item_for,
  }: {
    search_text: string;
    item_for: ItemFor;
  }) {
    const url = this.urlFragment + "/item";
    return this.#axiosConfig.APIGetRequestWrapper<
      AutoCompleteServiceReturnType<ItemAutoCompleteType>
    >(url, {
      searchParameters: [
        {
          key: "search_text",
          value: search_text,
        },
        {
          key: "item_for",
          value: item_for,
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
