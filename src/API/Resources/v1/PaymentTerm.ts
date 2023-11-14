type PaymentTerm = {
  payment_term_id: number;
  name: string;
  payment_term: number;
  is_default: boolean;
  interval: "end_of_month" | "regular" | "end_of_day";
};

export type { PaymentTerm };
