import {Currency} from "@/API/Resources/v1/Currency/Currency";

interface ContactGenerated {
  contact_id: number;
  status: "active" | "deleted";
}

interface ContactBasic extends ContactGenerated {
  contact_name: string;
  company_name: string;
  currency_id: number;
  currency_name?: Currency["currency_name"];
  currency_code?: Currency["currency_code"];
  currency_symbol?: Currency["currency_symbol"];
  payment_term_id: number;
  remarks?: string;
  contact_persons?: ContactPerson[];
}
interface ContactVendor extends ContactBasic {
    contact_type: "vendor";
}
interface ContactCustomer extends ContactBasic {
    contact_type: "customer";
    contact_sub_type: "individual" | "business";
}

type Contact = ContactVendor | ContactCustomer;



export { Contact };