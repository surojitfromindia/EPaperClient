import AppStateService, {
  AppStateResponse,
} from "@/API/Resources/v1/AppState/AppState.Service.ts";
import reduxStore from "../../../../redux/store.ts";
import { setOrganizationState } from "@/redux/features/organization/organizationSlice.ts";
import store from "../../../../redux/store.ts";
import { AppURLPaths } from "@/constants/AppURLPaths.Constants.ts";
import router from "@/BrowserRouter.tsx";
import { LocalStorageAccess } from "@/util/LocalStorageAccess.ts";

interface AppStateOrganization {
  name: string;
  primary_address: string;
  organization_id: number;
  currency_code: string;
  sector: string;
  country_code: string;
  currency_symbol: string;
  currency_name: string;
  currency_id: number;
}
interface AppState {
  organization: AppStateOrganization;
}

class ApplicationState {
  private static applicationState: ApplicationState;
  private readonly appState: AppState;

  private constructor(appState: AppStateResponse) {
    this.appState = appState;
    // update the store
    reduxStore.dispatch(setOrganizationState(appState.organization));
  }

  static getInstance() {
    if (this.applicationState) {
      return this.applicationState;
    } else {
      throw new Error("no instance found");
    }
  }

  static async build() {
    const appStateService = new AppStateService();
    const appStateResponse = await appStateService.getAppState();
    if (appStateResponse) {
      const app_state = appStateResponse.app_state;
      // the response could return an important error code that we need to handle
      if (app_state.no_organization) {
        await router.navigate(AppURLPaths.CREATE_ORGANIZATION);
        return;
      } else {
        this.applicationState = new ApplicationState(
          appStateResponse.app_state,
        );
        this.applicationState.setCurrentOrganization();
      }
      return;
    }
    throw new Error("can not build AppState");
  }

  getAppState(): AppState {
    const organization = store.getState().organization;
    return {
      organization,
    };
  }

  setCurrentOrganization(): void {
    LocalStorageAccess.saveOrganizationId(
      this.appState.organization.organization_id.toString(),
    );
  }
}

export { ApplicationState };
export type { AppState, AppStateOrganization };
