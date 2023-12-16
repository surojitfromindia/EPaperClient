import { Currency } from "@/API/Resources/v1/Currency.Service.ts";
import { APIService } from "@/API/Resources/v1/APIService.ts";
import APIAxiosConfig from "@/API/Resources/v1/APIAxiosConfig.ts";
import { TaxRate } from "@/API/Resources/v1/TaxRate.ts";
import { Item } from "@/API/Resources/v1/Item/Item.Service.ts";
import {PaymentTerm} from "@/API/Resources/v1/PaymentTerm.ts";

interface ContactGenerated {
  contact_id: number;
  status: "active" | "deleted";
}

interface Contact extends ContactGenerated {
  contact_name: string;
  company_name: string;
  currency_id: number;
  currency_name?: Currency["currency_name"];
  currency_code?: Currency["currency_code"];
  currency_symbol?: Currency["currency_symbol"];
  payment_term_id: number;
  remarks?: string;
  contact_type: "customer" | "vendor";
  contact_sub_type?: "individual" | "business";
}

type ContactEditPageContent = {
  taxes: TaxRate[];
  payment_terms: PaymentTerm[];
  contact?: Contact;
};
type EditPageServiceParams = {
  contact_id?: number;
};
type UpdateServiceParams = {
  contact_id?: number;
};

type ContactCreateCommonPayload = {
  contact_name: string;
  company_name: string;
  currency_id: number;
  currency_name?: Currency["currency_name"];
  currency_code?: Currency["currency_code"];
  currency_symbol?: Currency["currency_symbol"];
  payment_term_id: number;
  remarks?: string;
  contact_type: "customer" | "vendor";
};

type ContactTypeVendorPayload = ContactCreateCommonPayload;
type ContactTypeCustomerPayload = ContactCreateCommonPayload & {
  contact_sub_type: "individual" | "business";
};

type ContactCreatePayload =
  | ContactTypeVendorPayload
  | ContactTypeCustomerPayload;

class ContactService implements APIService {
  readonly urlFragment: string = "/contacts";
  #axiosConfig: typeof APIAxiosConfig;
  private readonly abortController: AbortController;

  constructor() {
    this.#axiosConfig = APIAxiosConfig;
    this.abortController = new AbortController();
  }

  getItems() {
    const url = this.urlFragment;
    return this.#axiosConfig.APIGetRequestWrapper<{
      items: Item[];
    }>(url, {
      searchParameters: [],
      abortController: this.abortController,
    });
  }
  getItemEditPage({ contact_id }: EditPageServiceParams = {}) {
    const url = this.urlFragment + "/edit_page";
    return this.#axiosConfig.APIGetRequestWrapper<ContactEditPageContent>(url, {
      searchParameters: [
        {
          key: "contact_id",
          value: contact_id,
        },
      ],
      abortController: this.abortController,
    });
  }

  addContact({ payload }: { payload: ContactCreatePayload }) {
    const url = this.urlFragment;
    return this.#axiosConfig.APIPostRequestWrapper<
      ContactCreatePayload,
      {
        contact: Contact;
      }
    >(url, payload);
  }
  getContact({ contact_id }: EditPageServiceParams = {}) {
    const url = `${this.urlFragment}/${contact_id}`;
    return this.#axiosConfig.APIGetRequestWrapper<{
      contact: Contact;
    }>(url, {
      searchParameters: [],
      abortController: this.abortController,
    });
  }

  abortGetRequest(): void {
    this.abortController.abort();
  }
}

export type { Contact };
export default ContactService;
