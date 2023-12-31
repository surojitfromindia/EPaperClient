import APIAxiosConfig from "@/API/Resources/v1/APIAxiosConfig.ts";
import { APIService } from "@/API/Resources/v1/APIService.ts";
import { ChartOfAccount } from "@/API/Resources/v1/ChartOfAccount/ChartOfAccount.Service.ts";
import {TaxRate} from "@/API/Resources/v1/TaxRate.ts";
import {ItemUnit} from "@/API/Resources/v1/ItemUnit.ts";

type ItemFor = "sales" | "purchase" | "sales_and_purchase";

interface ItemGenerated {
  item_id: number;
  product_type_formatted: string;
  item_for_formatted: string;
  tax_percentage: number;
  tax_name: string;
  sales_account_name?: string;
  purchase_account_name?: string;
  unit_id?:number,
}
interface Item extends ItemGenerated {
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
  purchase_account_id?: number;
  tax_id: number;
}
interface ItemTableView
  extends Pick<
    Item,
    | "name"
    | "unit"
    | "product_type_formatted"
    | "selling_price"
    | "selling_description"
    | "purchase_price"
    | "purchase_description"
  > {}
interface ItemCreatePayload extends Omit<Item, keyof ItemGenerated> {}



type ItemEditPageContent = {
  taxes: TaxRate[];
  units: ItemUnit[];
  income_accounts_list: ChartOfAccount[];
  purchase_accounts_list: ChartOfAccount[];
  inventory_accounts_list: ChartOfAccount[];
  item?: Item;
};
type EditPageServiceParams = {
  item_id?: number;
};
type UpdateServiceParams = {
  item_id?: number;
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
  getItemEditPage({ item_id }: EditPageServiceParams = {}) {
    const url = this.urlFragment + "/edit_page";
    return this.#axiosConfig.APIGetRequestWrapper<ItemEditPageContent>(url, {
      searchParameters: [
        {
          key: "item_id",
          value: item_id,
        },
      ],
      abortController: this.abortController,
    });
  }

  addItem({ payload }: { payload: ItemCreatePayload }) {
    const url = this.urlFragment;
    return this.#axiosConfig.APIPostRequestWrapper<
      ItemCreatePayload,
      {
        item: Item;
      }
    >(url, payload);
  }
  updateItem({
    payload,
    params,
  }: {
    payload: ItemCreatePayload;
    params: UpdateServiceParams;
  }) {
    const url = `${this.urlFragment}/${params.item_id}`;
    return this.#axiosConfig.APIPutRequestWrapper<
      ItemCreatePayload,
      {
        item: Item;
      }
    >(url, payload);
  }
  getItem({ item_id }: EditPageServiceParams = {}) {
    const url = `${this.urlFragment}/${item_id}`;
    return this.#axiosConfig.APIGetRequestWrapper<{
      item: Item;
    }>(url, {
      searchParameters: [],
      abortController: this.abortController,
    });
  }

  abortGetRequest(): void {
    this.abortController.abort();
  }
}

export default ItemService;
export type {
  Item,
  ItemEditPageContent,
  ItemCreatePayload,
  ItemFor,
  ItemTableView,
};
