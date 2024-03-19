import {INVOICE_DEFAULT_FILTER_BY} from "@/constants/Invoice.Constants.ts";

const allowedInvoiceFilters = [
    "Status.All",
    "Status.Draft",
    "Status.Overdue",
] as const;

type InvoiceAppliedFilter = (typeof allowedInvoiceFilters)[number];

export { allowedInvoiceFilters };
export type { InvoiceAppliedFilter };