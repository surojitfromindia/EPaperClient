import { APIService } from "@/API/Resources/v1/APIService.ts";
import APIAxiosConfig from "@/API/Resources/v1/APIAxiosConfig.ts";
import { Contact } from "@/API/Resources/v1/Contact/Contact";
import { TaxRate } from "@/API/Resources/v1/TaxRate.ts";
import { ChartOfAccount } from "@/API/Resources/v1/ChartOfAccount/ChartOfAccount.Service.ts";
import { CustomerPaymentSettings } from "@/API/Resources/v1/CustomerPayment/customerPayment";
import { Invoice } from "@/API/Resources/v1/Invoice/Invoice.Service.ts";
import { PaymentMode } from "@/API/Resources/v1/PaymentMode.Service.ts";

type CustomerPaymentEditPageFromInvoiceContent = {
  contact: Contact;
  invoice: Invoice;
  deposit_to_accounts_list: ChartOfAccount[];
  customer_payment_settings: CustomerPaymentSettings;
  payment_modes: PaymentMode[];
};

interface CustomerPaymentEditPageFromInvoiceParams {
  invoice_id: number;
}

class CustomerPaymentService implements APIService {
  readonly urlFragment: string = "/customer_payments";
  readonly urlSettingsFragment: string = "/settings/customer_payment";
  #axiosConfig: typeof APIAxiosConfig;
  private readonly abortController: AbortController;

  constructor() {
    this.#axiosConfig = APIAxiosConfig;
    this.abortController = new AbortController();
  }

  getEditPageFromInvoice({
    invoice_id,
  }: CustomerPaymentEditPageFromInvoiceParams) {
    const url = this.urlFragment + "/edit_page/from_invoice";
    return this.#axiosConfig.APIGetRequestWrapper<CustomerPaymentEditPageFromInvoiceContent>(
      url,
      {
        searchParameters: [
          {
            key: "invoice_id",
            value: invoice_id,
          },
        ],
        abortController: this.abortController,
      },
    );
  }
  abortGetRequest(): void {
    this.abortController.abort();
  }
}
export default CustomerPaymentService;
export type { CustomerPaymentEditPageFromInvoiceContent };
