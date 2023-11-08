import { APIService } from "@/API/Resources/v1/APIService.ts";
import APIAxiosConfig from "@/API/Resources/v1/APIAxiosConfig.ts";

interface InvoiceGenerated {
  invoice_id: number;
  invoice_number: string;
  discount_total: number;
  tax_total: number;
  sub_total: number;
  total: number;
}
interface InvoiceLineItemGenerated {
  line_item_id: number;
  tax_percentage: number;
  tax_amount: number;
  item_total: number;
  item_total_tax_included: number;
}
interface Invoice extends InvoiceGenerated {
  issue_date: string;
  due_date: string;
  issue_date_formatted: string;
    due_date_formatted: string;
  contact_id: number;
  contact_name: string;
  reference_number: string;
  order_number: string;
  terms: string;
  notes: string;
  is_inclusive_tax: string;
  line_items: InvoiceLineItem[];
}
interface InvoiceLineItem extends InvoiceLineItemGenerated {
  item_id: number;
  name: string;
  description: string;
  unit: string;
  unit_id: number;
  account_id: number;
  tax_id: number;
  rate: number;
  quantity: number;
  discount_percentage: number;
  discount_amount: number;
  tax_percentage: number;
}

type InvoiceEditPageServiceParams = {
  invoice_id?: number;
};


class InvoiceService implements APIService {
  readonly urlFragment: string = "/invoices";
  #axiosConfig: typeof APIAxiosConfig;
  private readonly abortController: AbortController;

  constructor() {
    this.#axiosConfig = APIAxiosConfig;
    this.abortController = new AbortController();
  }

  getInvoices() {
    const url = this.urlFragment;
    return this.#axiosConfig.APIGetRequestWrapper<{
      invoices: Invoice[];
    }>(url, {
      searchParameters: [],
      abortController: this.abortController,
    });
  }
  getInvoiceEditPage({ invoice_id }: InvoiceEditPageServiceParams = {}) {
    const url = this.urlFragment + "/edit_page";
    return this.#axiosConfig.APIGetRequestWrapper<any>(url, {
      searchParameters: [
        {
          key: "invoice_id",
          value: invoice_id,
        },
      ],
      abortController: this.abortController,
    });
  }

  abortGetRequest(): void {
    this.abortController.abort();
  }
}
export default InvoiceService;
export type { Invoice };