import APIAxiosConfig from "@/API/Resources/v1/APIAxiosConfig.ts";

type ChartOfAccount = {
    account_id: string,
    name: string,
    code: string,
    depth: number,
    user_id: number,
    account_parent_name : string,
    no_of_children: number,
}


class ChartOfAccountService {
    #axiosConfig: typeof APIAxiosConfig;
    constructor(axiosConfig: typeof APIAxiosConfig) {
        this.#axiosConfig = axiosConfig;
    }


    getChartOfAccounts(){
        const url = "/accounts";
        // return axiosConfig.("/accounts/login",payload)
        return this.#axiosConfig.APIGetRequestWrapper<{accounts: ChartOfAccount[] }>(url)
    }


}

export default new ChartOfAccountService(APIAxiosConfig)
export type  {ChartOfAccount}