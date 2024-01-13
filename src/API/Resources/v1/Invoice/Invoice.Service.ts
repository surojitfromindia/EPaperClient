import { APIService } from "@/API/Resources/v1/APIService.ts";
import APIAxiosConfig from "@/API/Resources/v1/APIAxiosConfig.ts";
import { ChartOfAccount } from "@/API/Resources/v1/ChartOfAccount/ChartOfAccount.Service.ts";
import { TaxRate } from "@/API/Resources/v1/TaxRate.ts";
import { ItemUnit } from "@/API/Resources/v1/ItemUnit.ts";
import { PaymentTerm } from "@/API/Resources/v1/PaymentTerm.ts";
import { InvoiceCreationPayloadType } from "@/API/Resources/v1/Invoice/InvoiceCreationPayloadTypes";
import { InvoiceUpdatePayloadType } from "@/API/Resources/v1/Invoice/InvoiceUpdatePayloadTypes";

import {Contact} from "@/API/Resources/v1/Contact/Contact";
import {InvoiceSettings} from "@/API/Resources/v1/Invoice/invoice";

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
  payment_term_id?: number;
  payment_term_name?: string;
  payment_term?: number;
  payment_term_interval?: string;
  issue_date_formatted: string;
  due_date_formatted: string;
  contact_id: number;
  contact_name: string;
  reference_number: string;
  order_number: string;
  terms: string;
  notes: string;
  is_inclusive_tax: boolean;
  line_items: InvoiceLineItem[];
  transaction_status: "draft" | "sent" | "void";
  currency_code: string;
  currency_symbol: string;
  currency_name: string;
  currency_id: number;
  exchange_rate?: number;
}
interface InvoiceLineItem extends InvoiceLineItemGenerated {
  item_id: number;
  product_type: string;
  name: string;
  description: string;
  unit: string;
  unit_id: number;
  account_id: number;
  account_name?: string;
  tax_id?: number;
  tax_name?: string;
  rate: number;
  quantity: number;
  discount_percentage: number;
  discount_amount: number;
  tax_percentage: number;
}

type InvoiceEditPageServiceParams = {
  invoice_id?: number;
};

type InvoiceEditPageContent = {
  taxes: TaxRate[];
  units: ItemUnit[];
  line_item_accounts_list: ChartOfAccount[];
  payment_terms: PaymentTerm[];
  invoice?: Invoice;
  contact?: Contact;
  invoice_settings : InvoiceSettings,
};
type InvoiceEditPageFromContactServiceParams = {
  contact_id?: number;
};

type InvoiceEditPageFromContactContent = {
  contact: Contact;
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
    return this.#axiosConfig.APIGetRequestWrapper<InvoiceEditPageContent>(url, {
      searchParameters: [
        {
          key: "invoice_id",
          value: invoice_id,
        },
      ],
      abortController: this.abortController,
    });
  }
  getInvoiceEditPageFromContact({
    contact_id,
  }: InvoiceEditPageFromContactServiceParams) {
    const url = this.urlFragment + "/edit_page/from_contact";
    return this.#axiosConfig.APIGetRequestWrapper<InvoiceEditPageFromContactContent>(
      url,
      {
        searchParameters: [
          {
            key: "contact_id",
            value: contact_id,
          },
        ],
        abortController: this.abortController,
      },
    );
  }

  addInvoice({ payload }: { payload: InvoiceCreationPayloadType }) {
    const url = this.urlFragment;
    return this.#axiosConfig.APIPostRequestWrapper<
      InvoiceCreationPayloadType,
      {
        invoice: Invoice;
      }
    >(url, payload);
  }
  updateInvoice({
    invoice_id,
    payload,
  }: {
    invoice_id: number;
    payload: InvoiceUpdatePayloadType;
  }) {
    const url = this.urlFragment + "/" + invoice_id;
    return this.#axiosConfig.APIPutRequestWrapper<
      InvoiceUpdatePayloadType,
      {
        invoice: Invoice;
      }
    >(url, payload);
  }

  abortGetRequest(): void {
    this.abortController.abort();
  }
}
export default InvoiceService;
export type {
  Invoice,
  InvoiceEditPageContent,
  InvoiceLineItem,
  InvoiceLineItemGenerated,
};
