const allowedInvoiceFilters = [
    "Status.All",
    "Status.Draft",
    "Status.Overdue",
] as const;
const defaultInvoiceFilter = "Status.All";

type InvoiceAppliedFilter = (typeof allowedInvoiceFilters)[number];

export { allowedInvoiceFilters, defaultInvoiceFilter };
export type { InvoiceAppliedFilter };