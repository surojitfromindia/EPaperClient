import { Currency } from "@/API/Resources/v1/Currency/Currency";
import { ItemUnit } from "@/API/Resources/v1/ItemUnit.ts";
import { PaymentTerm } from "@/API/Resources/v1/PaymentTerm.ts";
import { TaxRate } from "@/API/Resources/v1/TaxRate.ts";
import { AutoNumberGroup } from "@/API/Resources/v1/AutoNumberSeries/AutoNumberSeries";
import { ChartOfAccount } from "@/API/Resources/v1/ChartOfAccount/ChartOfAccount.Service.ts";
import { groupBy } from "lodash";

const mapPaymentTermToRSelect = (paymentTerm: Partial<PaymentTerm>) => ({
  label: `${paymentTerm.payment_term_name}`,
  value: paymentTerm.payment_term_id,
  is_default: paymentTerm.is_default,
  payment_term: paymentTerm.payment_term,
  interval: paymentTerm.interval,
});
const mapCurrencyRSelectOption = (currency: Partial<Currency>) => {
  return {
    label: `${currency.currency_code}(${currency.currency_symbol}) - ${currency.currency_name}`,
    value: currency.currency_id,
    ...currency,
  };
};
const mapUnitRSelectOption = (unit: ItemUnit) => {
  return {
    label: unit.unit,
    value: unit.unit,
    unit_id: unit.unit_id,
  };
};
const mapTaxRSelectOption = (tax: Partial<TaxRate>) => {
  return {
    label: `${tax.tax_name} [${tax.tax_percentage}%]`,
    value: tax.tax_id,
    tax_percentage: tax.tax_percentage,
  };
};

const mapAutoNumberGroupRSelectOption = (
  autoNumberGroup: Pick<
    AutoNumberGroup,
    "auto_number_group_name" | "auto_number_group_id"
  >,
) => {
  return {
    label: `${autoNumberGroup.auto_number_group_name}`,
    value: autoNumberGroup.auto_number_group_id,
  };
};

const mapAccountRSelectOption = (
  account: Pick<ChartOfAccount, "account_name" | "account_id">,
) => {
  return {
    label: `${account.account_name}`,
    value: account.account_id,
    account_name: account.account_name,
    ...account,
  };
};

const makeAccountRSelectGroupedOptions = (
  accounts: Pick<
    ChartOfAccount,
    "account_name" | "account_id" | "account_type_name_formatted"
  >[],
) => {
  // group by account type
  const groupedAccounts = groupBy(accounts, "account_type_name_formatted");
  return Object.keys(groupedAccounts).map((accountType) => {
    const accounts = groupedAccounts[accountType];
    return {
      label: accountType,
      options: accounts.map((account) => mapAccountRSelectOption(account)),
    };
  });
};

export {
  mapCurrencyRSelectOption,
  mapTaxRSelectOption,
  mapUnitRSelectOption,
  mapPaymentTermToRSelect,
  mapAutoNumberGroupRSelectOption,
  mapAccountRSelectOption,
  makeAccountRSelectGroupedOptions,
};

type TaxRSelectOption = ReturnType<typeof mapTaxRSelectOption>;
type CurrencyRSelectOption = ReturnType<typeof mapCurrencyRSelectOption>;
type UnitRSelectOption = ReturnType<typeof mapUnitRSelectOption>;
type PaymentTermRSelectOption = ReturnType<typeof mapPaymentTermToRSelect>;
type AutoNumberGroupRSelectOption = ReturnType<
  typeof mapAutoNumberGroupRSelectOption
>;
type AccountRSelectOption = ReturnType<typeof mapAccountRSelectOption>;
type AccountRSelectGroupedOptions = ReturnType<
  typeof makeAccountRSelectGroupedOptions
>;

export type {
  TaxRSelectOption,
  CurrencyRSelectOption,
  UnitRSelectOption,
  PaymentTermRSelectOption,
  AutoNumberGroupRSelectOption,
  AccountRSelectOption,
};
