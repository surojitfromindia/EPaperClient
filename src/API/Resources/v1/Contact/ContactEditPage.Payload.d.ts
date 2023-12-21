import { TaxRate } from "@/API/Resources/v1/TaxRate.ts";
import { PaymentTerm } from "@/API/Resources/v1/PaymentTerm.ts";
import { Contact } from "@/API/Resources/v1/Contact/Contact";

 type ContactEditPageContent = {
  taxes: TaxRate[];
  payment_terms: PaymentTerm[];
  contact?: Contact;
};
export type {
    ContactEditPageContent
}