import {InvoiceAppliedFilter} from "@/API/Resources/v1/util/invoiceFilter.ts";

type SortOrder = "A" | "D";

interface PageContext {
    per_page: number;
    page: number;
}
interface PageContextSingleFilter {
    filter_by: string;
}
interface PageContextSort {
    sort_column: string;
    sort_order: SortOrder
}


interface InvoicePageContext
    extends PageContext,
        PageContextSingleFilter,
        PageContextSort {
    filter_by: InvoiceAppliedFilter;
}


export type {
    InvoicePageContext
}

