type PaymentTerm = {
  payment_term_id: number;
  payment_term_name: string;
  payment_term: number;
  is_default: boolean;
  interval: "end_of_month" | "regular" | "end_of_day";
  is_custom?: boolean;
};

export type { PaymentTerm };
