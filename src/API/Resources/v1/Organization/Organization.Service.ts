import { APIService } from "@/API/Resources/v1/APIService.ts";
import APIAxiosConfig from "@/API/Resources/v1/APIAxiosConfig.ts";
import { Currency } from "@/API/Resources/v1/Currency/Currency";
import { OrganizationCreationPayloadType } from "@/API/Resources/v1/Organization/OrganizationCreationPayloadTypes";
import {Organization, OrganizationsUser} from "@/API/Resources/v1/Organization/Organization";

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

  getOrganizationsOfUser() {
    const url = "/users/organizations"
    return this.#axiosConfig.APIGetRequestWrapper<{
      organizations: OrganizationsUser[];
    }>(url, {
      searchParameters: [],
      abortController: this.abortController,
    });
  }

  abortGetRequest(): void {
    this.abortController.abort();
  }
}
export default OrganizationService;
