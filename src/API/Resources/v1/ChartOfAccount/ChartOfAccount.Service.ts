import APIAxiosConfig from "@/API/Resources/v1/APIAxiosConfig.ts";
import { APIService } from "@/API/Resources/v1/APIService.ts";

type ChartOfAccount = {
  account_id: number;
  account_name: string;
  account_code: string;
  depth: number;
  no_of_children: number;
  // account parent
  account_parent_name?: string;
  account_parent_id?: number;
  // account type
  account_type_name_formatted: string;
  account_type_name: string;
  account_type_id?:number,
  // account type
  account_group_name_formatted: string;
  account_group_name: string;
  account_group_id?:number;
};

type AccountType = {
  "account_type_name": string,
  "account_type_name_formatted": string,
  "account_group_name": string,
  "account_group_name_formatted": string,
}


type EditPageServiceParams = {
  account_id ?: number,
}

class ChartOfAccountService implements APIService {
  readonly urlFragment: string = "/accounts";
  #axiosConfig: typeof APIAxiosConfig;
  private readonly abortController: AbortController;

  constructor() {
    this.#axiosConfig = APIAxiosConfig;
    this.abortController = new AbortController();
  }

  getChartOfAccounts() {
    const url = "/accounts";
    return this.#axiosConfig.APIGetRequestWrapper<{
      accounts: ChartOfAccount[];
    }>(url, {
      searchParameters: [],
      abortController: this.abortController,
    });
  }

  getChartOfAccountEditPage({account_id}:EditPageServiceParams={}){
    const url = "/accounts/edit_page"
    return this.#axiosConfig.APIGetRequestWrapper<{
      account_types: AccountType[],
      accounts_list: ChartOfAccount[],
      chart_of_account: ChartOfAccount,
    }>(url, {
      searchParameters: [{
        key: "account_id",
        value: account_id
      }],
      abortController: this.abortController,
    });
  }

  abortGetRequest(): void {
    this.abortController.abort();
  }
}

export default ChartOfAccountService;
export type { ChartOfAccount, AccountType };
