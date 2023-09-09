import AppStateService, {
  AppStateResponse,
} from "@/API/Resources/v1/AppState/AppState.Service.ts";

interface AppState {
  organization:{
    name: string;
    primary_address: string;
    organization_id: number;
    currency_code: string;
    sector: string;
    country_code: string;
  },


}

class ApplicationState {
  private static applicationState: ApplicationState;
  private readonly appState: AppState;

  private constructor(appState: AppStateResponse) {
    this.appState = appState;
  }

  static getInstance() {
    if (this.applicationState) {
      return this.applicationState;
    }
    else{
      throw new Error("no instance found")
    }
  }

   static async build() {
    const appStateService = new AppStateService();
    const appStateResponse = await appStateService.getAppState();
    if (appStateResponse) {
      this.applicationState =new ApplicationState(appStateResponse.app_state);
      this.applicationState.setCurrentOrganization();
      return;
    }
    throw new Error("can not build AppState");
  }

  getAppState(): AppState {
    return {
      organization :{
        organization_id: this.appState.organization.organization_id,
        name: this.appState.organization.name,
        primary_address: this.appState.organization.primary_address,
        country_code: this.appState.organization.country_code,
        sector: this.appState.organization.sector,
        currency_code: this.appState.organization.currency_code,
      }

    };
  }

  setCurrentOrganization(): void {
    localStorage.setItem(
      "currentOrganization",
      this.appState.organization.organization_id.toString(),
    );
  }
}

export { ApplicationState };
export type { AppState };
