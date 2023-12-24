import { Currency } from "@/API/Resources/v1/Currency/Currency";
import { ItemUnit } from "@/API/Resources/v1/ItemUnit.ts";
import { PaymentTerm } from "@/API/Resources/v1/PaymentTerm.ts";
import { TaxRate } from "@/API/Resources/v1/TaxRate.ts";

const mapPaymentTermToRSelect = (paymentTerm: Partial<PaymentTerm>) => ({
  label: `${paymentTerm.payment_term_name}`,
  value: paymentTerm.payment_term_id,
  is_default: paymentTerm.is_default,
  payment_term: paymentTerm.payment_term,
  interval: paymentTerm.interval,
});
const makeCurrencyRSelectOptions = (currency: Partial<Currency>) => {
  return {
    label: `${currency.currency_code}(${currency.currency_symbol}) - ${currency.currency_name}`,
    value: currency.currency_id,
    ...currency,
  };
};
const makeUnitRSelectOptions = (unit: ItemUnit) => {
  return {
    label: unit.unit,
    value: unit.unit,
    unit_id: unit.unit_id,
  };
};
const makeTaxRSelectOptions = (tax: Partial<TaxRate>) => {
  return {
    label: `${tax.tax_name} [${tax.tax_percentage}%]`,
    value: tax.tax_id,
  };
};
export {
  makeCurrencyRSelectOptions,
  makeTaxRSelectOptions,
  makeUnitRSelectOptions,
  mapPaymentTermToRSelect,
};

type TaxRSelectOption = ReturnType<typeof makeTaxRSelectOptions>;
type CurrencyRSelectOption = ReturnType<typeof makeCurrencyRSelectOptions>;
type UnitRSelectOption = ReturnType<typeof makeUnitRSelectOptions>;
type PaymentTermRSelectOption = ReturnType<typeof mapPaymentTermToRSelect>;

export type {
  TaxRSelectOption,
  CurrencyRSelectOption,
  UnitRSelectOption,
  PaymentTermRSelectOption,
};
