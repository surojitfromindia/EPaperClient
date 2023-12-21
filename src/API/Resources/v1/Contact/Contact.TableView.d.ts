import {Contact} from "@/API/Resources/v1/Contact/Contact";
import {Currency} from "@/API/Resources/v1/Currency/Currency";

type ContactTableView = {
  contact_name: Contact["contact_name"]
  company_name?: Contact["company_name"];
  currency_code?: Currency["currency_code"];
  currency_name?: Currency["currency_name"];
  currency_symbol?: Currency["currency_symbol"];
};
export { ContactTableView };