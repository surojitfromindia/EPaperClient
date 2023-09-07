import AppStateService, {
  AppStateResponse,
} from "@/API/Resources/v1/AppState/AppState.Service.ts";

interface AppState {
  name: string;
  primary_address: string;
  organization_id: number;
  currency_code: string;
  sector: string;
  country_code: string;
}

class ApplicationState {
  private static applicationState: ApplicationState;
  readonly appState: AppState;

  private constructor(appState: AppStateResponse) {
    this.appState = appState;
  }

  static async getInstance() {
    if (this.applicationState) {
      return this.applicationState;
    } else {
      return await this.build();
    }
  }

  private static async build() {
    const appStateService = new AppStateService();
    const appStateResponse = await appStateService.getAppState();
    if (appStateResponse) {
      return new ApplicationState(appStateResponse.app_state);
    }
    throw new Error("can not build AppState");
  }

  getAppState(): AppState {
    return {
      organization_id: this.appState.organization_id,
      name: this.appState.name,
      primary_address: this.appState.primary_address,
      country_code: this.appState.country_code,
      sector: this.appState.sector,
      currency_code: this.appState.currency_code,
    };
  }

  setCurrentOrganization(): void {
    localStorage.setItem(
      "currentOrganization",
      this.appState.organization_id.toString(),
    );
  }
}

const applicationState = await ApplicationState.getInstance();
applicationState.setCurrentOrganization();
export { applicationState };
export type { AppState };
