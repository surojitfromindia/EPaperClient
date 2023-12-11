import { Currency } from "@/API/Resources/v1/Currency.Service.ts";

interface ContactGenerated  {
  contact_id: number;
  status: "active" | "deleted";
};

interface Contact extends ContactGenerated {
  contact_name: string;
  company_name: string;
  currency_id: number;
  currency_name?: Currency["currency_name"];
  currency_code?: Currency["currency_code"];
  currency_symbol?: Currency["currency_symbol"];
  payment_term_id: number;
  remarks?: string;
  contact_type: "customer" | "vendor";
  contact_sub_type?: "individual" | "business";

}

export type {
  Contact,
}

