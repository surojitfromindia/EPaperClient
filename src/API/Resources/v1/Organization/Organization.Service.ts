import { APIService } from "@/API/Resources/v1/APIService.ts";
import APIAxiosConfig from "@/API/Resources/v1/APIAxiosConfig.ts";
import { Currency } from "@/API/Resources/v1/Currency/Currency";
import { OrganizationCreationPayloadType } from "@/API/Resources/v1/Organization/OrganizationCreationPayloadTypes";

interface Organization {
  country_code: string;
  created_by_id: number;
  currency_code: string;
  currency_id: Currency["currency_id"];
  currency_name: Currency["currency_name"];
  currency_symbol: Currency["currency_symbol"];
  name: string;
  organization_id: number;
  primary_address: string;
  sector: string;
}

class OrganizationService implements APIService {
  readonly urlFragment: string = "/organizations";
  #axiosConfig: typeof APIAxiosConfig;
  private readonly abortController: AbortController;

  constructor() {
    this.#axiosConfig = APIAxiosConfig;
    this.abortController = new AbortController();
  }

  registerOrganization({
    payload,
  }: {
    payload: OrganizationCreationPayloadType;
  }) {
    const url = this.urlFragment;
    return this.#axiosConfig.APIPostRequestWrapper<
      OrganizationCreationPayloadType,
      {
        organization: Organization;
      }
    >(url, payload);
  }

  abortGetRequest(): void {
    this.abortController.abort();
  }
}
export default OrganizationService;
