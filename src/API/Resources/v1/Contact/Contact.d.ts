import { Currency } from "@/API/Resources/v1/Currency/Currency";
import { TaxRate } from "@/API/Resources/v1/TaxRate.ts";
import { PaymentTerm } from "@/API/Resources/v1/PaymentTerm.ts";
import { ContactPerson } from "@/API/Resources/v1/ContactPerson/ContactPerson";

interface ContactGenerated {
  contact_id: number;
  status: "active" | "deleted";
}

type ContactType = "vendor" | "customer";

interface ContactBasic extends ContactGenerated {
  contact_name: string;
  company_name: string;
  currency_id: number;
  currency_name?: Currency["currency_name"];
  currency_code?: Currency["currency_code"];
  currency_symbol?: Currency["currency_symbol"];
  payment_term_id: PaymentTerm["payment_term_id"];
  payment_term_name?: PaymentTerm["payment_term_name"];
  remarks?: string;
  contact_persons?: ContactPerson[];
  contact_type: ContactType;
  tax_id?: TaxRate["tax_id"];
  first_name?: ContactPerson["first_name"];
  last_name?: ContactPerson["last_name"];
  email?: ContactPerson["email"];
  phone?: ContactPerson["phone"];
  mobile?: ContactPerson["mobile"];
  salutation?: ContactPerson["salutation"];
  balances?: ContactBalance[];
  outstanding_credits_payable_amount: number;
  outstanding_credits_payable_amount_bcy: number;
  outstanding_credits_receivable_amount: number;
  outstanding_credits_receivable_amount_bcy: number;
  unused_credits_payable_amount: number;
  unused_credits_payable_amount_bcy: number;
  unused_credits_receivable_amount: number;
  unused_credits_receivable_amount_bcy: number;
}
interface ContactVendor extends ContactBasic {
  contact_type: "vendor";
}
interface ContactCustomer extends ContactBasic {





  contact_type: "customer";
  contact_sub_type: "individual" | "business";
}

type Contact = ContactVendor | ContactCustomer;

interface ContactBalance {
  currency_id: Currency["currency_id"];
  currency_name: Currency["currency_name"];
  currency_code: Currency["currency_code"];
  currency_symbol: Currency["currency_symbol"];
  is_default: boolean;
  outstanding_credits_payable_amount: number;
  outstanding_credits_payable_amount_bcy: number;
  outstanding_credits_receivable_amount: number;
  outstanding_credits_receivable_amount_bcy: number;
  unused_credits_payable_amount: number;
  unused_credits_payable_amount_bcy: number;
  unused_credits_receivable_amount: number;
  unused_credits_receivable_amount_bcy: number;
}

export { Contact, ContactType, ContactBalance };
