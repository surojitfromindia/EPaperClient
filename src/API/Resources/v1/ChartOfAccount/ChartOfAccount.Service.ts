import APIAxiosConfig from "@/API/Resources/v1/APIAxiosConfig.ts";
import {APIService} from "@/API/Resources/v1/APIService.ts";

type ChartOfAccount = {
    account_id: string,
    name: string,
    code: string,
    depth: number,
    user_id: number,
    account_parent_name: string,
    no_of_children: number,
}


class ChartOfAccountService implements APIService{
    #axiosConfig: typeof APIAxiosConfig;
    private readonly abortController: AbortController;
    readonly urlFragment: string = "/accounts"

    constructor() {
        this.#axiosConfig = APIAxiosConfig;
        this.abortController = new AbortController();
    }


    getChartOfAccounts() {
        const url = "/accounts";
        return this.#axiosConfig.APIGetRequestWrapper<{ accounts: ChartOfAccount[] }>(url, {
            searchParameters: [],
            abortController: this.abortController
        })
    }

    abortGetRequest(): void {
        this.abortController.abort()
    }




}

export default ChartOfAccountService
export type  {ChartOfAccount}