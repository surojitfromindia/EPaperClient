import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store.ts";
import { AppStateOrganization } from "@/API/Resources/v1/AppState/AppState.ts";

// Define a type for the slice state
interface OrganizationState extends AppStateOrganization {
}

// Define the initial state using that type
const initialState: OrganizationState = {
  country_code: "",
  currency_code: "",
  organization_id: 0,
  primary_address: "",
  sector: "",
  name: "",
};

export const organizationSlice = createSlice({
  name: "organization",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setOrganizationState: (state, action: PayloadAction<OrganizationState>) => {
      state = action.payload;
      return state;
    },
  },
});

export const { setOrganizationState } = organizationSlice.actions;

export const selectOrganization = (state: RootState) => state.organization;

export default organizationSlice.reducer;
