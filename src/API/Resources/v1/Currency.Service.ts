interface CurrencyGenerated {
    currency_id: number;
    status: "active" | "deleted";
}
interface Currency extends CurrencyGenerated {
    currency_name: string;
    currency_code: string;
    currency_symbol: string;
}

export type {
    Currency,
}