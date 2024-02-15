interface CustomViewEntitySelectColumn {
  default_filter_order: number;
  is_mandatory: boolean;
  is_editable: boolean;
  is_default_select_column: boolean;
  value: string;
  key: string;
  is_sortable: boolean;
  alias: string[];
    align: string;
}
interface CustomViewEntityView {
  default_filters: CustomViewEntityDefaultFilter[];
}
interface CustomViewEntityDefaultFilter {
  title: string;
  value: string;
  key: string;
  is_default: boolean;
  empty_msg: string;
  status: string;
}

interface CustomView {
  entity_select_columns: {
    invoice: CustomViewEntitySelectColumn[];
  };
  entity_views: {
    invoice: CustomViewEntityView;
  };
}

export type { CustomView };
