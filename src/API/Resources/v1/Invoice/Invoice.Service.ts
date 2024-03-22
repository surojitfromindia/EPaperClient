import { APIService } from "@/API/Resources/v1/APIService.ts";
import APIAxiosConfig from "@/API/Resources/v1/APIAxiosConfig.ts";
import { ChartOfAccount } from "@/API/Resources/v1/ChartOfAccount/ChartOfAccount.Service.ts";
import { TaxRate } from "@/API/Resources/v1/TaxRate.ts";
import { ItemUnit } from "@/API/Resources/v1/ItemUnit.ts";
import { PaymentTerm } from "@/API/Resources/v1/PaymentTerm.ts";
import { InvoiceCreationPayloadType } from "@/API/Resources/v1/Invoice/InvoiceCreationPayloadTypes";
import { InvoiceUpdatePayloadType } from "@/API/Resources/v1/Invoice/InvoiceUpdatePayloadTypes";

import { Contact } from "@/API/Resources/v1/Contact/Contact";
import {
  InvoiceAutoNumberSettingsUpdatePayload,
  InvoiceDashboardData,
  InvoiceSettings,
} from "@/API/Resources/v1/Invoice/invoice";
import { InvoicePageContext } from "@/API/Resources/v1/util/pageContext.ts";
import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
} from "@/constants/Pagination.Constants.ts";
import { INVOICE_DEFAULT_FILTER_BY } from "@/constants/Invoice.Constants.ts";

interface InvoiceGenerated {
  invoice_id: number;
  invoice_number: string;
  discount_total: number;
  tax_total: number;
  sub_total: number;
  total: number;
  due_days: number;
  due_days_formatted: string;
  transaction_status_formatted: string;
  issue_date_formatted: string;
  due_date_formatted: string;
  discount_total_formatted: string;
  tax_total_formatted: string;
  sub_total_formatted: string;
  total_formatted: string;
  exchange_rate_formatted: string;
  balance: number;
  balance_formatted: string;
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
  invoice_settings: InvoiceSettings;
};
type InvoiceEditPageFromContactServiceParams = {
  contact_id?: number;
};

type InvoiceEditPageFromContactContent = {
  contact: Contact;
  taxes: TaxRate[];
  units: ItemUnit[];
  line_item_accounts_list: ChartOfAccount[];
  payment_terms: PaymentTerm[];
  invoice_settings: InvoiceSettings;
};

interface GetInvoicesParamsQuery {
  filter_by?: string;
}
interface GetInvoicesParamsQueryOptions {
  per_page?: number;
  page?: number;
  sort_column?: string;
  sort_order?: string;
}

const DEFAULT_GET_INVOICES_PARAMS: {
  query: GetInvoicesParamsQuery;
  options: GetInvoicesParamsQueryOptions;
} = {
  query: {
    filter_by: INVOICE_DEFAULT_FILTER_BY,
  },
  options: {
    per_page: DEFAULT_PAGE_SIZE,
    page: DEFAULT_PAGE_NUMBER,
    sort_column: "issue_date",
    sort_order: "A",
  },
};

class InvoiceService implements APIService {
  readonly urlFragment: string = "/invoices";
  readonly urlSettingsFragment: string = "/settings/invoice";
  #axiosConfig: typeof APIAxiosConfig;
  private readonly abortController: AbortController;

  constructor() {
    this.#axiosConfig = APIAxiosConfig;
    this.abortController = new AbortController();
  }

  getInvoices(
    query: GetInvoicesParamsQuery = {},
    options: GetInvoicesParamsQueryOptions = {},
  ) {
    const { page, per_page, sort_column, sort_order } = options;
    const { filter_by } = query;
    const url = this.urlFragment;
    return this.#axiosConfig.APIGetRequestWrapper<{
      invoices: Invoice[];
      page_context: InvoicePageContext;
    }>(url, {
      searchParameters: [
        {
          key: "filter_by",
          value: filter_by,
        },
        {
          key: "per_page",
          value: per_page,
        },
        {
          key: "page",
          value: page,
        },
        {
          key: "sort_column",
          value: sort_column,
        },
        {
          key: "sort_order",
          value: sort_order,
        },
      ],
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

  updateInvoiceAutoNumberSettings({
    payload,
  }: {
    payload: InvoiceAutoNumberSettingsUpdatePayload;
  }) {
    const url = this.urlSettingsFragment + "/auto_number";
    return this.#axiosConfig.APIPutRequestWrapper<
      InvoiceAutoNumberSettingsUpdatePayload,
      {
        invoice_settings: InvoiceSettings;
      }
    >(url, payload);
  }
  getInvoiceDashboard() {
    const url = this.urlFragment + "/dashboard";
    return this.#axiosConfig.APIGetRequestWrapper<{
      dash_board_data: InvoiceDashboardData;
    }>(url, {
      searchParameters: [],
      abortController: this.abortController,
    });
  }

  getInvoice({ invoice_id }: { invoice_id: number }) {
    const url = this.urlFragment + "/" + invoice_id;
    return this.#axiosConfig.APIGetRequestWrapper<{
      invoice: Invoice;
    }>(url, {
      searchParameters: [],
      abortController: this.abortController,
    });
  }

  abortGetRequest(): void {
    this.abortController.abort();
  }
}
export default InvoiceService;
export { DEFAULT_GET_INVOICES_PARAMS };
export type {
  Invoice,
  InvoiceEditPageContent,
  InvoiceLineItem,
  InvoiceLineItemGenerated,
};
