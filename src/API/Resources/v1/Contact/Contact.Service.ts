import { APIService } from "@/API/Resources/v1/APIService.ts";
import APIAxiosConfig from "@/API/Resources/v1/APIAxiosConfig.ts";
import { ContactCreatePayload } from "@/API/Resources/v1/Contact/ContactCreate.Payload";
import { Contact } from "@/API/Resources/v1/Contact/Contact";
import { ContactEditPageContent } from "@/API/Resources/v1/Contact/ContactEditPage.Payload";

type EditPageServiceParams = {
  contact_id?: number;
};

class ContactService implements APIService {
  readonly urlFragment: string = "/contacts";
  #axiosConfig: typeof APIAxiosConfig;
  private readonly abortController: AbortController;

  constructor() {
    this.#axiosConfig = APIAxiosConfig;
    this.abortController = new AbortController();
  }

  getContacts() {
    const url = this.urlFragment;
    return this.#axiosConfig.APIGetRequestWrapper<{
      contacts: Contact[];
    }>(url, {
      searchParameters: [],
      abortController: this.abortController,
    });
  }
  getContactEditPage({ contact_id }: EditPageServiceParams = {}) {
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

export  { ContactService };
