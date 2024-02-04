import APIAxiosConfig from "@/API/Resources/v1/APIAxiosConfig.ts";
import { APIService } from "@/API/Resources/v1/APIService.ts";

type ChartOfAccount = {
  account_id: number;
  account_name: string;
  account_code: string;
  depth: number;
  no_of_children: number;
  is_system_account: boolean;
  // account parent
  account_parent_name?: string;
  account_parent_id?: number;
  // account type
  account_type_name_formatted: string;
  account_type_name: string;
  account_type_id?: number;
  // account group
  account_group_name_formatted: string;
  account_group_name: string;
  account_group_id?: number;
};

type AccountType = {
  account_type_name: string;
  account_type_name_formatted: string;
  account_group_name: string;
  account_group_name_formatted: string;
};

type ChartOfAccountCreatePayload = {
  account_name: string;
  account_code: string;
  // account parent
  account_parent_id: number | null;
  // account type
  account_type_name: string;
  description: string;
};

type EditPageServiceParams = {
  account_id?: number;
};

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
      chart_of_accounts: ChartOfAccount[];
    }>(url, {
      searchParameters: [],
      abortController: this.abortController,
    });
  }

  getChartOfAccountEditPage({ account_id }: EditPageServiceParams = {}) {
    const url = "/accounts/edit_page";
    return this.#axiosConfig.APIGetRequestWrapper<{
      account_types: AccountType[];
      accounts_list: ChartOfAccount[];
      chart_of_account: ChartOfAccount;
    }>(url, {
      searchParameters: [
        {
          key: "account_id",
          value: account_id,
        },
      ],
      abortController: this.abortController,
    });
  }

  addChartOfAccounts({ payload }: { payload: ChartOfAccountCreatePayload }) {
    const url = "/accounts";
    return this.#axiosConfig.APIPostRequestWrapper<
      ChartOfAccountCreatePayload,
      {
        chart_of_account: ChartOfAccount;
      }
    >(url, payload);
  }

  deleteSingleChartOfAccounts({ account_id }: { account_id: number }) {
    const url = `/accounts/${account_id}`;
    return this.#axiosConfig.APIDeleteRequestWrapper<{
      account_ids: number[];
    }>(url);
  }

  getChartOfAccount({ account_id }: EditPageServiceParams = {}) {
    const url = `/accounts/${account_id}`;
    return this.#axiosConfig.APIGetRequestWrapper<{
      chart_of_account: ChartOfAccount;
    }>(url, {
      searchParameters: [],
      abortController: this.abortController,
    });
  }

  abortGetRequest(): void {
    this.abortController.abort();
  }
}

export default ChartOfAccountService;
export type { ChartOfAccount, AccountType, ChartOfAccountCreatePayload };
