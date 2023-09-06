import AppStateService, {AppStateResponse} from "@/API/Resources/v1/AppState/AppState.Service.ts";

type IAppState = {
    "name": string
    "primary_address": string,
    "organization_id": number
    "currency_code": string
    "sector": string
    "country_code": string
}

class AppState {
    readonly organization_id: number;
    readonly name: string
    readonly primary_address: string
    readonly currency_code: string;
    readonly sector: string;
    readonly country_code: string
    readonly appStateService: AppStateService;

    private constructor(appStateService:AppStateService,appState:AppStateResponse) {
        this.appStateService = appStateService;
        this.organization_id = appState.organization_id;
        this.name = appState.name;
        this.primary_address = appState.primary_address;
        this.currency_code = appState.currency_code;
        this.sector = appState.sector;
        this.country_code = appState.country_code;
    }

    static async build(){
        const appStateService = new AppStateService();

        const appStateResponse = await appStateService.getAppState();
        if(appStateResponse){
            const appState = appStateResponse.app_state;
            return new AppState(appStateService,appState)
        }
        throw new Error("can not build AppState")
    }

    getAppState(): IAppState {
        return {
            organization_id:this.organization_id,
            name: this.name,
            primary_address:this.primary_address,
            country_code:this.country_code,
            sector: this.sector,
            currency_code: this.currency_code
        }

    }
}

export {AppState}
export type {IAppState}