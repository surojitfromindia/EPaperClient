import { Currency } from "@/API/Resources/v1/Currency.Service.ts";

interface ContactGenerated  {
  contact_id: number;
  status: "active" | "deleted";
};

interface Contact extends ContactGenerated {
  contact_name: string;
  currency_id: number;
  currency_name?: Currency["currency_name"];
  currency_code?: Currency["currency_code"];
  currency_symbol?: Currency["currency_symbol"];
}

export type {
  Contact,
}

