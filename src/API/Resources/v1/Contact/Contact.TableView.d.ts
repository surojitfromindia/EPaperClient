import { Contact } from "@/API/Resources/v1/Contact/Contact";
import { Currency } from "@/API/Resources/v1/Currency/Currency";
import { ContactPerson } from "@/API/Resources/v1/ContactPerson/ContactPerson";

type ContactTableView = {
  contact_name: Contact["contact_name"];
  company_name?: Contact["company_name"];
  email?: ContactPerson["email"];
  phone?: ContactPerson["phone"];
  outstanding_credits_receivable_amount: Contact["outstanding_credits_receivable_amount"];
  unused_credits_receivable_amount: Contact["unused_credits_receivable_amount"];
  outstanding_credits_receivable_amount_bcy: Contact["outstanding_credits_receivable_amount_bcy"];
  unused_credits_receivable_amount_bcy: Contact["unused_credits_receivable_amount_bcy"];
};
export { ContactTableView };
