import { Currency } from "@/API/Resources/v1/Currency/Currency";
import { Contact } from "@/API/Resources/v1/Contact/Contact";

type ContactCreateCommonPayload = {
  contact_name: Contact["contact_name"];
  company_name: Contact["company_name"];
  currency_id: Currency["currency_id"];
  currency_name?: Currency["currency_name"];
  currency_code?: Currency["currency_code"];
  currency_symbol?: Currency["currency_symbol"];
  payment_term_id: number;
  remarks?: string;
  contact_type: "customer" | "vendor";
};
type ContactVendorPayload = ContactCreateCommonPayload & {
  contact_type: "vendor";
};
type ContactCustomerPayload = ContactCreateCommonPayload & {
  contact_type: "customer";
  contact_sub_type: "individual" | "business";
};
type ContactCreatePayload = ContactVendorPayload | ContactCustomerPayload;

export { ContactCreatePayload };
