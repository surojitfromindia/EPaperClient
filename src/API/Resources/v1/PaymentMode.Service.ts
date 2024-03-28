interface PaymentMode {
    payment_mode_id: number;
    name: string;
    system_name: string;
    is_default: boolean;
}

export type { PaymentMode };