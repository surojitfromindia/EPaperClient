import { CustomView } from "@/API/Resources/v1/CustomView/CustomView";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { organizationSlice } from "@/redux/features/organization/organizationSlice.ts";
import { RootState } from "@/redux/store.ts";

interface CustomViewState extends CustomView {}

const initialState: CustomViewState = {
  entity_select_columns: {
    invoice: [],
  },
  entity_views: {
    invoice: {
      default_filters: [],
    },
  },
};

export const customViewSlice = createSlice({
  name: "customView",
  initialState,
  reducers: {
    setCustomViewState: (state, action: PayloadAction<CustomViewState>) => {
      state = action.payload;
      return state;
    },
  },
});

const { setCustomViewState } = customViewSlice.actions;

const selectCustomViewStateOfInvoice = (state: RootState) => {
  return {
    entity_select_columns: state.customView.entity_select_columns.invoice,
    entity_views: state.customView.entity_views.invoice,
  };
};

export { setCustomViewState, selectCustomViewStateOfInvoice };
export default customViewSlice.reducer;
