import APIAxiosConfig from "@/API/Resources/v1/APIAxiosConfig.ts";
import { APIService } from "@/API/Resources/v1/APIService.ts";

interface Item  {
    item_id: number;
    name:string,
    product_type : string,
    product_type_formatted:string,
    unit?:string,
    selling_price?:number;
    selling_description?:string,
    purchase_price?:number;
    purchase_description?:string

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
    // addChartOfAccounts({ payload }: { payload: ChartOfAccountCreatePayload }) {
    //     const url = "/accounts";
    //     return this.#axiosConfig.APIPostRequestWrapper<
    //         ChartOfAccountCreatePayload,
    //         {
    //             chart_of_account: ChartOfAccount;
    //         }
    //     >(url, payload);
    // }
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
export type { Item };
