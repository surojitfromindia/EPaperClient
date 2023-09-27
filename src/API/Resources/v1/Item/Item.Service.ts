import APIAxiosConfig from "@/API/Resources/v1/APIAxiosConfig.ts";
import { APIService } from "@/API/Resources/v1/APIService.ts";
import { ChartOfAccount } from "@/API/Resources/v1/ChartOfAccount/ChartOfAccount.Service.ts";

type ItemFor = "sales" | "purchase" | "sales_and_purchase"
interface Item {
  item_id: number;
  name: string;
  product_type: "service" | "goods";
  product_type_formatted: string;
  unit?: string;
  item_for: ItemFor;
  selling_price?: number;
  selling_description?: string;
  purchase_price?: number;
  purchase_description?: string;
  sales_account_id?: number;
  sales_account_name?: string;
  purchase_account_id?: number;
  purchase_account_name?: string;
  tax_id:number;
}
interface ItemCreatePayload extends Omit<Item, "item_id"|"product_type_formatted">{

}

type ItemUnit = {
  unit_id: number;
  unit: string;
  unit_name?: string;
};

type TaxRate = {
  tax_id: number;
  name: string;
  rate: number;
  rate_formatted: string;
};

type ItemEditPageContent = {
  taxes: TaxRate[];
  units: ItemUnit[];
  income_accounts_list: ChartOfAccount[];
  purchase_accounts_list: ChartOfAccount[];
  inventory_accounts_list: ChartOfAccount[];
};

class ItemService implements APIService {
  readonly urlFragment: string = "/items";
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
  getItemEditPage() {
    const url = this.urlFragment + "/edit_page";
    return this.#axiosConfig.APIGetRequestWrapper<ItemEditPageContent>(url, {
      searchParameters: [],
      abortController: this.abortController,
    });
  }
  //
  // getChartOfAccountEditPage({ account_id }: EditPageServiceParams = {}) {
  //     const url = "/accounts/edit_page";
  //     return this.#axiosConfig.APIGetRequestWrapper<{
  //         account_types: AccountType[];
  //         accounts_list: ChartOfAccount[];
  //         chart_of_account: ChartOfAccount;
  //     }>(url, {
  //         searchParameters: [
  //             {
  //                 key: "account_id",
  //                 value: account_id,
  //             },
  //         ],
  //         abortController: this.abortController,
  //     });
  // }
  //
  addItem({ payload }: { payload: ItemCreatePayload }) {
      const url = this.urlFragment;
      return this.#axiosConfig.APIPostRequestWrapper<
          ItemCreatePayload,
          {
              item: Item;
          }
      >(url, payload);
  }
  //
  // deleteSingleChartOfAccounts({ account_id }: { account_id: number }) {
  //     const url = `/accounts/${account_id}`;
  //     return this.#axiosConfig.APIDeleteRequestWrapper<{
  //         account_ids: number[];
  //     }>(url);
  // }
  //
  // getChartOfAccount({ account_id }: EditPageServiceParams = {}) {
  //     const url = `/accounts/${account_id}`;
  //     return this.#axiosConfig.APIGetRequestWrapper<{
  //         chart_of_account: ChartOfAccount;
  //     }>(url, {
  //         searchParameters: [],
  //         abortController: this.abortController,
  //     });
  // }

  abortGetRequest(): void {
    this.abortController.abort();
  }
}

export default ItemService;
export type { Item, ItemEditPageContent, ItemCreatePayload, ItemFor };