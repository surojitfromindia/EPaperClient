import { TaxRate } from "@/API/Resources/v1/TaxRate.ts";
import { PaymentTerm } from "@/API/Resources/v1/PaymentTerm.ts";
import { Contact } from "@/API/Resources/v1/Contact/Contact";
import { Currency } from "@/API/Resources/v1/Currency/Currency";

type ContactEditPageContent = {
  taxes: TaxRate[];
  payment_terms: PaymentTerm[];
  contact?: Contact;
  currencies: Currency[];
};
export type { ContactEditPageContent };
