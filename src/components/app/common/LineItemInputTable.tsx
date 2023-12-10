import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactSelect, {
  components,
  DropdownIndicatorProps,
  OnChangeValue,
  OptionProps,
} from "react-select";
import {
  reactSelectComponentOverride,
  reactSelectStyle,
  reactSelectStyleBorderLess,
} from "@/util/style/reactSelectStyle.ts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import {
  ArrowRight,
  ChevronDown,
  CircleEllipsis,
  Pencil,
  PlusCircle,
  XCircle,
} from "lucide-react";
import LoaderComponent from "@/components/app/common/LoaderComponent.tsx";
import ReactAsyncSelect from "react-select/async";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Button } from "@/components/ui/button.tsx";
import AutoCompleteService from "@/API/Resources/v1/AutoComplete.Service.ts";
import ItemService from "@/API/Resources/v1/Item/Item.Service.ts";
import { InvoiceLineItem } from "@/API/Resources/v1/Invoice/Invoice.Service.ts";
import { TaxRate } from "@/API/Resources/v1/TaxRate.ts";
import { cn } from "@/lib/utils.ts";
import { Badge } from "@/components/ui/badge.tsx";
import RNumberFormat, {
  RNumberFormatAsText,
} from "@/components/app/common/RNumberFormat.tsx";
import { MathLib } from "@/util/MathLib/mathLib.ts";
import ItemAdd from "@/components/app/Items/ItemAdd.tsx";
import { Dialog, DialogContent } from "@/components/ui/dialog.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { isValidNumber } from "@/util/validityCheckUtil.ts";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Contact } from "@/API/Resources/v1/Contact.Service.ts";
import { useAppSelector } from "@/redux/hooks.ts";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const autoCompleteService = new AutoCompleteService();
const itemService = new ItemService();
const mathLib = new MathLib({ precision: 2 });

type LineItemInputTableProps = {
  taxesDropDown: { label: string; value: number; tax_percentage: number }[]; // Replace 'any' with the actual type
  itemFor: "sales" | "purchase";
  line_items?: InvoiceLineItem[];
  onLineItemsUpdate: (line_items: {
    is_inclusive_tax: boolean;
    line_items: LineItemRowType[];
    exchange_rate: number;
  }) => void;
  isCreateMode?: boolean;
  isTransactionInclusiveTax?: boolean;
  contactDetails?: Contact;
  transactionExchangeRate?: number;
  onOnlyExchangeRateChange?: (exchange_rate: number) => void; // when the exchange rate is changed, but re-calculations are not needed.
};
type LINE_ITEM_OPTION_TYPE = {
  label: string;
  value: number;
  rate: number;
};
type LineItemTaxRowType = {
  label: string;
  value: number;
  tax_percentage: number;
} | null;
type LineItemRowType = {
  item: LINE_ITEM_OPTION_TYPE | null;
  product_type: string;
  unit: string;
  unit_id?: number;
  description: string;
  quantity: number;
  rate: number;
  rate_base: number;
  tax: LineItemTaxRowType;
  tax_percentage: number;
  tax_amount: number;
  discount_percentage: number;
  discount_amount: number;
  item_total: number;
  item_total_tax_included: number;
  is_loading: boolean;
  account?: {
    label: string;
    value: number;
  } | null;
};

const BLANK_ROW: LineItemRowType = Object.freeze({
  item: null,
  unit: "",
  product_type: "",
  description: "",
  quantity: 1,
  rate: 0,
  rate_base: 0,
  tax: null,
  tax_percentage: 0,
  tax_amount: 0,
  discount_percentage: 0,
  discount_amount: 0,
  item_total: 0,
  item_total_tax_included: 0,
  is_loading: false,
  account: null,
});

export function LineItemInputTable({
  taxesDropDown,
  itemFor,
  line_items = [],
  onLineItemsUpdate,
  isCreateMode = true,
  isTransactionInclusiveTax = false,
  contactDetails,
  transactionExchangeRate,
  onOnlyExchangeRateChange,
}: LineItemInputTableProps) {
  const organizationDetails = useAppSelector(
    ({ organization }) => organization,
  );

  // currency details
  const organizationCurrencyDetails = useMemo(() => {
    const organization_details = organizationDetails;
    return {
      currency_symbol: organization_details?.currency_symbol,
      currency_code: organization_details?.currency_code,
      currency_name: organization_details?.currency_name,
    };
  }, [organizationDetails]);
  const contactCurrencyDetails = useMemo(() => {
    if (!contactDetails) return null;
    return {
      currency_symbol: contactDetails.currency_symbol,
      currency_code: contactDetails.currency_code,
      currency_name: contactDetails.currency_name,
    };
  }, [contactDetails]);
  const showExchangeRateInput = useMemo(() => {
    // show exchange rate input only if the contact currency is different from the organization currency.
    if (!contactDetails) return false;
    return contactDetails.currency_code !== organizationDetails.currency_code;
  }, [contactDetails, organizationDetails]);

  const [lineItems, setLineItems] = useState([]);
  const [isInclusiveTax, setIsInclusiveTax] = useState(
    isTransactionInclusiveTax,
  );
  const [exchangeRateValue, setExchangeRateValue] = useState(
    transactionExchangeRate,
  );
  useEffect(() => {
    setExchangeRateValue(transactionExchangeRate);
  }, [transactionExchangeRate]);

  const [itemEditingModalOpenFor, setItemEditingModalOpenFor] = useState(null);
  /**
   * only call this function if we want to update any needed state in the parent component.
   * such as selected item, or when tax treatment is changed.
   * or a new row is added, deleted, cloned.
   */
  const updateParentLineItemState = useCallback(
    (new_line_items: LineItemRowType[]) => {
      updateParentLineItemAndTaxState(
        new_line_items,
        isInclusiveTax,
        exchangeRateValue,
      );
    },
    [isInclusiveTax, exchangeRateValue],
  );
  const updateParentLineItemAndTaxState = useCallback(
    (
      new_line_items: LineItemRowType[],
      is_inclusive_tax: boolean,
      exchange_rate: number,
    ) => {
      setLineItems(new_line_items);
      onLineItemsUpdate?.({
        line_items: new_line_items,
        is_inclusive_tax: is_inclusive_tax,
        exchange_rate: exchange_rate,
      });
    },
    [onLineItemsUpdate],
  );
  useEffect(() => {
    // at the time of creation, if line_items is empty, then add a blank row.
    if (isCreateMode && lineItems.length === 0) {
      updateParentLineItemState([Object.assign({}, BLANK_ROW)]);
    }
  }, [isCreateMode, lineItems.length, updateParentLineItemState]);

  // when line_items is updated from parent, update the local state.
  useEffect(() => {
    if (line_items.length > 0) {
      const mapped_line_items = line_items.map((line_item) => ({
        item: {
          label: line_item.name,
          value: line_item.item_id,
          rate: line_item.rate,
        },
        product_type: line_item.product_type,
        unit: line_item.unit,
        unit_id: line_item.unit_id,
        description: line_item.description,
        quantity: line_item.quantity,
        rate: line_item.rate,
        rate_base: line_item.rate,
        discount_percentage: line_item.discount_percentage,
        discount_amount: line_item.discount_amount,
        tax: line_item.tax_id
          ? {
              label: `${line_item.tax_name} [${line_item.tax_percentage}%]`,
              value: line_item.tax_id,
              tax_percentage: line_item.tax_percentage,
            }
          : null,
        tax_percentage: line_item.tax_percentage,
        tax_amount: line_item.tax_amount,
        item_total: line_item.item_total,
        item_total_tax_included: line_item.item_total_tax_included,
        is_loading: false,
        account: {
          label: line_item.account_name,
          value: line_item.account_id,
        },
      }));
      setIsInclusiveTax(isTransactionInclusiveTax);
      setLineItems(mapped_line_items);
      onLineItemsUpdate?.({
        line_items: mapped_line_items,
        is_inclusive_tax: isTransactionInclusiveTax,
        exchange_rate: transactionExchangeRate,
      }); // parent callback
    }
  }, [line_items]);

  const [isInitialItemLoadingDone, setIsInitialItemLoadingDone] =
    useState(false);
  const [isInitialLoadingInProgress, setIsInitialLoadingInProgress] =
    useState(false);
  const [itemDefaultList, setItemDefaultList] = useState<
    { label: string; value: number }[]
  >([]);

  const itemAutoCompleteFetch = useCallback(
    async (search_text: string): Promise<Array<LINE_ITEM_OPTION_TYPE>> => {
      const auto_complete_data = await autoCompleteService.getItems({
        search_text: search_text,
        item_for: itemFor,
      });
      const { results } = auto_complete_data;
      return results.map((entry) => ({
        label: entry.text,
        value: entry.id,
        rate: itemFor === "sales" ? entry.selling_price : entry.purchase_price,
      }));
    },
    [itemFor],
  );
  const handleItemAutoCompleteInitialFocus = useCallback(() => {
    if (isInitialItemLoadingDone) return;
    else {
      setIsInitialItemLoadingDone(true);
      setIsInitialLoadingInProgress(true);
      itemAutoCompleteFetch("")
        .then((data) => {
          setItemDefaultList(data);
          setIsInitialLoadingInProgress(false);
        })
        .catch((error) => console.log(error));
    }
  }, [itemAutoCompleteFetch, isInitialItemLoadingDone]);
  const handleItemAutoCompleteChange = useCallback(
    (
      search_text: string,
      callback: (arg0: LINE_ITEM_OPTION_TYPE[]) => void,
    ) => {
      itemAutoCompleteFetch(search_text).then((data) => callback(data));
    },
    [itemAutoCompleteFetch],
  );

  const singleLineItemCalculation = useCallback(
    (line_item: LineItemRowType, is_inclusive_tax: boolean) => {
      // calculate sub total
      const quantity = isValidNumber(line_item.quantity)
        ? line_item.quantity
        : 0;

      const rate = isValidNumber(line_item.rate)
        ? mathLib.getWithPrecision(line_item.rate)
        : 0;
      const tax_percentage = isValidNumber(line_item.tax_percentage)
        ? line_item.tax_percentage
        : 0;

      const published_price = quantity * rate;
      let discount_amount: number;
      let item_total: number;
      let tax_amount: number;
      let item_total_tax_included: number;
      const tax_decimal = mathLib.getDecimalFromPercentage(tax_percentage);

      if (is_inclusive_tax === false) {
        discount_amount =
          published_price * (line_item.discount_percentage / 100);
        item_total = published_price - discount_amount;
        // calculate tax
        tax_amount = item_total * tax_decimal;
        // calculate total
        item_total_tax_included = item_total + tax_amount;
      } else {
        const sub_total_without_tax = published_price / (1 + tax_decimal);
        discount_amount =
          sub_total_without_tax * (line_item.discount_percentage / 100);
        item_total = sub_total_without_tax - discount_amount;
        tax_amount = item_total * tax_decimal;
        item_total_tax_included = item_total + tax_amount;
      }
      return {
        ...line_item,
        rate: rate,
        quantity: quantity,
        discount_amount: mathLib.getWithPrecision(discount_amount),
        item_total: mathLib.getWithPrecision(item_total),
        tax_amount: mathLib.getWithPrecision(tax_amount),
        item_total_tax_included: mathLib.getWithPrecision(
          item_total_tax_included,
        ),
      };
    },
    [],
  );
  const calculateLineItems = useCallback(
    (line_items: LineItemRowType[], is_inclusive_tax: boolean) => {
      return line_items.map((line_item) =>
        singleLineItemCalculation(line_item, is_inclusive_tax),
      );
    },
    [singleLineItemCalculation],
  );

  const handleTaxInclusiveExclusiveChange = (
    selected: OnChangeValue<{ label: string; value: boolean }, false>,
  ) => {
    const value = selected.value;
    setIsInclusiveTax(value);
    const line_items = calculateLineItems(lineItems, value);
    updateParentLineItemAndTaxState(line_items, value, exchangeRateValue);
  };
  const handleItemSelect = (item_id: number, index: number) => {
    const temp_line_item = [...lineItems];
    if (!item_id) {
      temp_line_item[index] = Object.assign({}, BLANK_ROW);
      setLineItemsAndCalculate(temp_line_item);
      return;
    } else {
      temp_line_item[index] = {
        ...temp_line_item[index],
        is_loading: true,
      };
      setLineItems([...temp_line_item]);
    }
    // do an item api call.
    itemService
      .getItem({
        item_id,
      })
      .then((data) => {
        const fetched_item = data.item;
        const updated_line_items = lineItems.map((item, item_index) => {
          if (item_index === index) {
            const rate =
              itemFor === "sales"
                ? fetched_item.selling_price
                : fetched_item.purchase_price;
            item.rate_base = rate;
            item.rate = rate / exchangeRateValue;
            item.product_type = fetched_item.product_type;

            item.unit = fetched_item.unit;
            item.unit_id = fetched_item.unit_id;
            item.description =
              itemFor === "sales"
                ? fetched_item.selling_description
                : fetched_item.purchase_description;
            item.tax = {
              label: `${fetched_item.tax_name} [${fetched_item.tax_percentage}%]`,
              value: fetched_item.tax_id,
              tax_percentage: fetched_item.tax_percentage,
            };
            item.tax_percentage = fetched_item.tax_percentage;
            item.item = {
              label: fetched_item.name,
              value: fetched_item.item_id,
            };
            item.is_loading = false;
            item.account = {
              label:
                itemFor === "sales"
                  ? fetched_item.sales_account_name
                  : fetched_item.purchase_account_name,
              value:
                itemFor === "sales"
                  ? fetched_item.sales_account_id
                  : fetched_item.purchase_account_id,
            };
            return item;
          }
          return item;
        });
        setLineItemsAndCalculate(updated_line_items);
      })
      .catch((error) => console.log(error));
  };

  const handleNewRowAt = (index: number) => {
    const temp_line_item = [...lineItems];
    temp_line_item.splice(index + 1, 0, Object.assign({}, BLANK_ROW));

    updateParentLineItemState([...temp_line_item]);
  };

  const handleRowRemoveAt = (index: number) => {
    if (lineItems.length === 1) return;
    const temp_line_item = [...lineItems];
    temp_line_item.splice(index, 1);
    updateParentLineItemState([...temp_line_item]);
  };

  const handleRowCloneAt = (index: number) => {
    const temp_line_item = [...lineItems];
    const cloned_item = Object.assign({}, temp_line_item[index]);
    // remove some fields from cloned_item that we don't want to clone, such as line_item_id.
    Reflect.deleteProperty(cloned_item, "line_item_id");
    // insert the cloned item at the index + 1
    temp_line_item.splice(index + 1, 0, cloned_item);
    updateParentLineItemState([...temp_line_item]);
  };

  const setLineItemsAndCalculate = (line_items: LineItemRowType[]) => {
    const calculated_line_items = calculateLineItems(
      [...line_items],
      isInclusiveTax,
    );
    setLineItems(calculated_line_items);
    onLineItemsUpdate?.({
      line_items,
      is_inclusive_tax: isInclusiveTax,
      exchange_rate: exchangeRateValue,
    }); // parent callback
  };

  const handleInputFocusChange = () => {
    setLineItemsAndCalculate(lineItems);
  };

  const handleDiscountChange = (value: number, index: number) => {
    value = value > 100 || value < 0 ? 0 : value;
    const temp_line_item = [...lineItems].map((item, item_index) => {
      if (item_index === index) {
        return {
          ...item,
          discount_percentage: value,
        };
      }
      return item;
    });
    setLineItems(temp_line_item);
  };
  // similar to quantity change
  const handleQuantityChange = (value: number, index: number) => {
    const temp_line_item = [...lineItems].map((item, item_index) => {
      if (item_index === index) {
        return {
          ...item,
          quantity: value,
        };
      }
      return item;
    });
    setLineItems(temp_line_item);
  };

  // similar to price change
  const handlePriceChange = (value: number, index: number) => {
    const temp_line_item = [...lineItems].map((item, item_index) => {
      if (item_index === index) {
        return {
          ...item,
          // on manual price change, we need to update the rate_base as well.
          // which is the same with given rate.
          rate_base: value,
          rate: value,
        };
      }
      return item;
    });
    setLineItems(temp_line_item);
  };

  const handleTaxChange = (selected_tax: TaxRate | null, index: number) => {
    const tax = selected_tax ? selected_tax : "";
    const temp_line_item = [...lineItems].map(
      (item, item_index): LineItemRowType => {
        if (item_index === index) {
          return {
            ...item,
            tax: tax,
            tax_percentage: tax ? tax.tax_percentage : 0,
          };
        }
        return item;
      },
    );
    setLineItemsAndCalculate(temp_line_item);
  };

  const handleDescriptionChange = (
    ev: React.FocusEvent<HTMLTextAreaElement>,
    index: number,
  ) => {
    const raw_value = ev.target.value;
    const temp_line_item = [...lineItems].map((item, item_index) => {
      if (item_index === index) {
        return {
          ...item,
          description: raw_value,
        };
      }
      return item;
    });
    setLineItemsAndCalculate(temp_line_item);
  };

  const handleSelectItemRemove = (index: number) => {
    const temp_line_item = [...lineItems];
    temp_line_item[index] = Object.assign({}, BLANK_ROW);
    updateParentLineItemState([...temp_line_item]);
  };

  const handleIteEditClick = (item_id: number) => {
    setItemEditingModalOpenFor(item_id);
  };
  const handleItemAddModalClose = () => {
    setItemEditingModalOpenFor(null);
  };

  const handleExchangeInfoSave = ({
    exchange_rate,
    update_all_line_items,
  }: {
    exchange_rate: number;
    update_all_line_items: boolean;
  }) => {
    const hasExchangeRateChanged = exchangeRateValue !== exchange_rate;
    if (hasExchangeRateChanged) {
      setExchangeRateValue(exchange_rate);
      if (update_all_line_items) {
        let line_items = lineItems.map((line_item) => ({
          ...line_item,
          rate: line_item.rate_base / exchange_rate, // just update the rate, don't update the rate_base.
        }));

        line_items = calculateLineItems(line_items, isInclusiveTax);
        setLineItems(line_items);
        updateParentLineItemAndTaxState(
          line_items,
          isInclusiveTax,
          exchange_rate,
        );
      } else {
        onOnlyExchangeRateChange?.(exchange_rate);
      }
    }
  };

  return (
    <>
      <div className={"flex flex-col space-y-3 "}>
        <div className={"flex items-end justify-between max-w-[900px]"}>
          <ReactSelect
            className={"w-[150px]"}
            classNames={reactSelectStyle}
            components={{
              ...reactSelectComponentOverride,
            }}
            onChange={handleTaxInclusiveExclusiveChange}
            placeholder={"Tax treatment"}
            value={{
              label: isInclusiveTax ? "Tax Inclusive" : "Tax Exclusive",
              value: isInclusiveTax,
            }}
            options={[
              { label: "Tax Inclusive", value: true },
              { label: "Tax Exclusive", value: false },
            ]}
            isSearchable={false}
          />
          {showExchangeRateInput && (
            <ExchangeInputComponent
              contactCurrencyDetails={contactCurrencyDetails}
              exchangeRateValue={exchangeRateValue}
              organizationCurrencyDetails={organizationCurrencyDetails}
              onExchangeInfoSave={handleExchangeInfoSave}
            />
          )}
        </div>
        <Table className="divide-y  divide-gray-200 border-y border-gray-300 w-[900px]">
          <TableHeader>
            <TableRow className="divide-x divide-gray-200 hover:bg-transparent  ">
              <TableHead className="w-[380px] px-4 py-1 text_thead">
                item
              </TableHead>
              <TableHead className="w-[100px] px-4 py-1 text_thead text-right">
                quantity
              </TableHead>
              <TableHead className="w-[100px] px-4 py-1 text_thead text-right">
                rate
              </TableHead>
              <TableHead className="w-[100px] px-4 py-1 text_thead text-right">
                discount (%)
              </TableHead>
              <TableHead className="w-[170px] px-4 py-1 text_thead">
                tax (%)
              </TableHead>
              <TableHead className="text-right px-4 pr-1 text_thead">
                <div>amount</div>
                <div className={"relative break-words"}>
                  <div className={"absolute -top-[17px] -right-[32px] "}>
                    <CircleEllipsis className={"w-4 h-4 text-primary"} />
                  </div>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineItems.map((lineItem, index) => (
              <TableRow
                key={index}
                className="divide-x divide-gray-200 hover:bg-none!impotant"
              >
                {lineItem.is_loading && (
                  <TableCell colSpan={6}>
                    <div className={"relative h-10 w-full"}>
                      <LoaderComponent mText={""} />
                    </div>
                  </TableCell>
                )}
                {!lineItem.is_loading && (
                  <>
                    <TableCell className="px-1 py-1 align-top">
                      <div className="w-full flex flex-col space-y-1">
                        {lineItem.item && (
                          <div
                            className={
                              "pl-3 pr-2 flex justify-between w-full py-2"
                            }
                          >
                            <div className="text-sm">{lineItem.item.label}</div>
                            <div className="text-xs text-gray-500">
                              <div className={"flex space-x-1"}>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <CircleEllipsis
                                      type={"button"}
                                      className={
                                        "w-4 h-4 text-gray-400 cursor-pointer"
                                      }
                                      name={"more_option_on_line_item"}
                                    />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    side={"bottom"}
                                    align={"end"}
                                    className="w-36"
                                  >
                                    <DropdownMenuItem onClick={() => {}}>
                                      View Details{" "}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        handleIteEditClick(lineItem.item.value);
                                      }}
                                    >
                                      Edit Item{" "}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                <XCircle
                                  type={"button"}
                                  className={
                                    "w-4 h-4 text-gray-400 cursor-pointer"
                                  }
                                  onClick={() => handleSelectItemRemove(index)}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        <div className={cn(!lineItem.item ? "" : "hidden")}>
                          <ReactAsyncSelect
                            name={"line_item"}
                            openMenuOnFocus={true}
                            inputId={`line_item-${index}`}
                            className={"w-full"}
                            defaultOptions={itemDefaultList}
                            loadOptions={handleItemAutoCompleteChange}
                            onFocus={handleItemAutoCompleteInitialFocus}
                            placeholder="Type or select an item"
                            classNames={reactSelectStyleBorderLess}
                            components={{
                              ...reactSelectComponentOverride,
                              DropdownIndicator: () => null,
                              Option: ITEM_OPTIONS_COMPONENT,
                            }}
                            menuPortalTarget={document.body}
                            isClearable={false}
                            value={lineItem.item}
                            onChange={(e_value) => {
                              handleItemSelect(
                                e_value ? e_value.value : null,
                                index,
                              );
                            }}
                            isLoading={isInitialLoadingInProgress}
                            hideSelectedOptions={true}
                          />
                        </div>

                        {lineItem.item && (
                          <Textarea
                            name={"line_item_description"}
                            className="w-full min-h-[40px] border-0 max bg-gray-50/80 text-gray-500"
                            placeholder="Item Description"
                            defaultValue={lineItem.description}
                            onBlur={(ev) => {
                              handleDescriptionChange(ev, index);
                            }}
                          />
                        )}
                        {lineItem.item && (
                          <div className={"w-auto"}>
                              <Badge
                                className={
                                  "text-[10px] px-1 py-0.5 rounded-none bg-teal-600 capitalize"
                                }
                              >
                                {lineItem.product_type}
                              </Badge>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-1 py-1 align-top">
                      <div className={"flex flex-col items-end space-y-2"}>
                        <RNumberFormat
                          name={"line_item_quantity"}
                          value={lineItem.quantity}
                          customInput={Input}
                          className="w-full border-0 text-right"
                          allowNegative={false}
                          decimalScale={6}
                          onBlur={() => {
                            handleInputFocusChange();
                          }}
                          onValueChange={({ floatValue }) => {
                            handleQuantityChange(floatValue, index);
                          }}
                        />
                        <div className={"w-auto"}>
                          {lineItem.unit && (
                            <Badge
                              className={
                                "text-[10px] px-1 py-0.5 rounded-sm capitalize"
                              }
                            >
                              {lineItem.unit}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-1 py-1 align-top">
                      <div>
                        <RNumberFormat
                          name={"line_item_rate"}
                          value={lineItem.rate}
                          customInput={Input}
                          className="w-full border-0 text-right"
                          allowNegative={false}
                          onBlur={() => {
                            handleInputFocusChange();
                          }}
                          onValueChange={({ floatValue }) => {
                            handlePriceChange(floatValue, index);
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="px-1 py-1 align-top">
                      <div>
                        <RNumberFormat
                          name={"line_item_discount_percentage"}
                          value={lineItem.discount_percentage}
                          customInput={Input}
                          className="w-full border-0 text-right"
                          allowNegative={false}
                          onBlur={() => {
                            handleInputFocusChange();
                          }}
                          onValueChange={({ floatValue }) => {
                            handleDiscountChange(floatValue, index);
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="px-0 py-0 align-top">
                      <div>
                        <ReactSelect
                          name={"line_item_tax"}
                          className={"w-full z-100"}
                          options={taxesDropDown}
                          placeholder={"Select tax"}
                          classNames={reactSelectStyleBorderLess}
                          components={{
                            ...reactSelectComponentOverride,
                            DropdownIndicator: (
                              props: DropdownIndicatorProps,
                            ) => {
                              if (props.selectProps.value) {
                                return null; // Return null to not display anything when a value is selected
                              }
                              return (
                                <components.DropdownIndicator {...props} />
                              );
                            },
                          }}
                          menuPortalTarget={document.body}
                          isClearable={true}
                          value={lineItem.tax}
                          onChange={(selected_tax) => {
                            handleTaxChange(selected_tax, index);
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-1 py-1 align-top">
                      <div>
                        {isInclusiveTax
                          ? lineItem.item_total_tax_included
                          : lineItem.item_total}
                      </div>
                      <div className={"relative break-words"}>
                        <div className={"absolute -top-[17px] -right-[32px] "}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <CircleEllipsis
                                type={"button"}
                                className={
                                  "w-4 h-4 text-primary cursor-pointer"
                                }
                              />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-36">
                              <DropdownMenuItem
                                onClick={() => handleNewRowAt(index + 1)}
                              >
                                New Row Below
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleNewRowAt(index - 1)}
                              >
                                New Row Above
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleRowCloneAt(index)}
                              >
                                Clone
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        {
                          <div
                            className={"absolute -top-[17px] -right-[55px] "}
                          >
                            <XCircle
                              type={"button"}
                              className={
                                "w-4 h-4 text-destructive cursor-pointer"
                              }
                              onClick={() => handleRowRemoveAt(index)}
                            />
                          </div>
                        }
                      </div>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex mt-2.5 justify-between w-[900px] ">
          <div className={"flex flex-col flex-1 justify-between mr-10"}>
            <div className={"flex"}>
              <Button
                variant="secondary"
                className={"border-r-0 rounded-r-none h-8 pl-2"}
                type={"button"}
                aria-description={"Add new row at the end"}
                onClick={() => handleNewRowAt(lineItems.length)}
              >
                <PlusCircle className={"h-4 w-4 text-primary mr-1"} />
                New Row
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size={"icon"}
                    className={"ml-[1px] border-l-0 rounded-l-none h-8 px-1"}
                    type={"button"}
                    aria-description={"More options on adding new rows"}
                  >
                    <ChevronDown className={"h-4 w-4"} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-36">
                  <DropdownMenuItem>Bulk Insert</DropdownMenuItem>
                  <DropdownMenuItem>Insert Header</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className={"mt-3"}>
              <FormField
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        name={"contact_notes"}
                        className=" bg-gray-50/80 text-gray-500 "
                        placeholder={"Thank you for your business."}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
                name={"notes"}
              />
            </div>
          </div>

          <div className={"w-[400px]"}>
            <LineItemOverviewComponent
              line_items={lineItems}
              is_inclusive_tax={isInclusiveTax}
              transactionCurrencySymbol={
                contactCurrencyDetails?.currency_symbol ??
                organizationCurrencyDetails?.currency_symbol ??
                ""
              }
            />
          </div>
        </div>{" "}
      </div>
      <ItemAddModal
        openModal={!!itemEditingModalOpenFor}
        itemId={itemEditingModalOpenFor}
        onClose={handleItemAddModalClose}
      />
    </>
  );
}

const ITEM_OPTIONS_COMPONENT: React.FC<
  OptionProps<LINE_ITEM_OPTION_TYPE, false>
> = (props) => (
  <components.Option {...props}>
    <div className="flex flex-col">
      <div className="text-sm">{props.data.label}</div>
      <div className="text-xs text-gray-500">Rate : ${props.data.rate}</div>
    </div>
  </components.Option>
);

const ExchangeInputComponent = ({
  contactCurrencyDetails,
  exchangeRateValue,
  organizationCurrencyDetails,
  onExchangeInfoSave,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const eRateSchema = z.object({
    exchange_rate: z.number().nonnegative("Exchange rate must be positive"),
    update_all_line_items: z.boolean(),
  });
  const form = useForm<z.infer<typeof eRateSchema>>({
    resolver: zodResolver(eRateSchema),
    defaultValues: {
      exchange_rate: exchangeRateValue,
      update_all_line_items: false,
    },
  });
  const { handleSubmit, control } = form;
  const handleFormSubmit = (data: z.infer<typeof eRateSchema>) => {
    const exchange_rate = data.exchange_rate;
    const update_all_line_items = data.update_all_line_items;
    onExchangeInfoSave?.({ exchange_rate, update_all_line_items });
    setIsPopoverOpen(false);
  };

  return (
    <div className={"flex items-center space-x-1 rounded-md bg-secondary pl-2"}>
      <div className={"text-xs font-medium "}> 1</div>
      <span className={"text-xs  font-medium capitalize text-primary"}>
        {contactCurrencyDetails?.currency_code ??
          contactCurrencyDetails?.currency_code}
      </span>
      <span>
        <ArrowRight className={"h-3 w-3 mx-1"} />
      </span>
      <RNumberFormatAsText
        className={"text-xs font-medium"}
        value={exchangeRateValue}
      />
      <Popover open={isPopoverOpen}>
        <div className={"flex items-center"}>
          <span className={"text-xs  font-medium"}>
            {organizationCurrencyDetails?.currency_code ??
              organizationCurrencyDetails?.currency_code}
          </span>
          <PopoverTrigger asChild>
            <Button
              variant="ghost_secondary"
              size={"icon"}
              className={"border-l-0 rounded-l-none h-8 w-8 ml-1"}
              type={"button"}
              aria-description={"More options on adding new rows"}
              onClick={() => setIsPopoverOpen((prev) => !prev)}
            >
              <Pencil className={"h-4 w-4"} />
            </Button>
          </PopoverTrigger>
        </div>

        <PopoverContent className="w-80" align={"end"}>
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Exchange rate</h4>
              <p className="text-sm text-muted-foreground">
                Set the exchange rate for this transaction.
              </p>
            </div>
            <Form {...form}>
              <div className="grid gap-2 mb-4">
                <div className=" w-full">
                  <FormField
                    name={"exchange_rate"}
                    render={({ field }) => (
                      <FormItem
                        className={"flex flex-row items-center space-x-2 "}
                      >
                        <FormLabel
                          htmlFor={"exchange_rate"}
                          className={"capitalize"}
                        >
                          Rate
                        </FormLabel>
                        <div className=" flex-col">
                          <FormControl>
                            <RNumberFormat
                              value={field.value}
                              id="exchange_rate"
                              onValueChange={({ floatValue }) => {
                                field.onChange(floatValue);
                              }}
                              customInput={Input}
                              getInputRef={field.ref}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <div className=" w-full flex items-center space-x-3">
                  <FormField
                    render={({ field }) => (
                      <FormItem
                        className={"flex flex-row items-start space-y-0"}
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="update_all_line_items"
                            name={"update_all_line_items"}
                            className={"inline-flex mt-1.5 mr-2"}
                          />
                        </FormControl>
                        <div className="">
                          <FormLabel
                            htmlFor={"update_all_line_items"}
                            className={" capitalize"}
                          >
                            Update all line items
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                    name={"update_all_line_items"}
                    control={control}
                  />
                </div>
              </div>

              <div className="flex justify-start">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSubmit(handleFormSubmit)}
                >
                  Save
                </Button>
              </div>
            </Form>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

const LineItemOverviewComponent = ({
  line_items,
  is_inclusive_tax,
  transactionCurrencySymbol,
}: {
  line_items: LineItemRowType[];
  is_inclusive_tax: boolean;
  transactionCurrencySymbol: string;
}) => {
  const sum_of_item_total =
    line_items.length > 0
      ? line_items.reduce(
          (acc, item) => mathLib.getWithPrecision(acc + item.item_total),
          0,
        )
      : 0;
  const sum_of_item_total_tax_included =
    line_items.length > 0
      ? line_items.reduce(
          (acc, item) =>
            mathLib.getWithPrecision(acc + item.item_total_tax_included),
          0,
        )
      : 0;
  const tax_groups = useMemo(() => {
    const tax_groups: {
      [key: number]: LineItemRowType[];
    } = {};
    line_items
      .filter((item) => item.tax_percentage > 0)
      .forEach((item) => {
        const tax_percentage = item.tax_percentage;
        if (tax_groups[tax_percentage]) {
          tax_groups[tax_percentage].push(item);
        } else {
          tax_groups[tax_percentage] = [item];
        }
      });
    return Object.entries(tax_groups).map(([, value]) => {
      const tax_total = value.reduce((acc, item) => acc + item.tax_amount, 0);
      const first_item = value[0];
      const tax_label = first_item.tax.label;
      return {
        tax_label,
        tax_total: mathLib.getWithPrecision(tax_total),
      };
    });
  }, [line_items]);

  return (
    <div className={"p-5 bg-secondary rounded h-full"}>
      <div className={"grid grid-cols-10 justify-between mb-2"}>
        <div className={"col-span-7"}>
          <div className={"text-sm font-medium"}>
            Sub Total
            {is_inclusive_tax && (
              <>
                <br />
                <span className={"text-xs"}>
                  {is_inclusive_tax ? "(Tax inclusive)" : ""}
                </span>
              </>
            )}
          </div>
        </div>
        <div className={"col-span-3 text-right"}>
          <RNumberFormat
            value={
              is_inclusive_tax
                ? sum_of_item_total_tax_included
                : sum_of_item_total
            }
            className={" text-sm font-medium"}
            displayType={"text"}
            decimalScale={2}
            fixedDecimalScale={true}
          />
        </div>
      </div>
      {
        // if tax_groups is empty, then don't show the tax row.
        tax_groups.length > 0 && (
          <div className={"my-5 flex-col"}>
            {tax_groups.map((tax_group, index) => (
              <div
                key={index}
                className={
                  "grid grid-cols-10 justify-between border-l-2 py-1.5"
                }
              >
                <div className={"col-span-7 pl-3"}>
                  <div className={"text-sm"}>{tax_group.tax_label}</div>
                </div>
                <div className={"col-span-3 text-right"}>
                  <RNumberFormat
                    value={tax_group.tax_total}
                    className={" text-sm "}
                    displayType={"text"}
                    decimalScale={2}
                    fixedDecimalScale={true}
                  />
                </div>
              </div>
            ))}
          </div>
        )
      }
      <Separator className={"my-2"} />
      <div className={"grid grid-cols-10 justify-between text-lg"}>
        <div className={"col-span-7 font-medium"}>
          Total ({transactionCurrencySymbol})
        </div>
        <div className={"col-span-3 text-right"}>
          <RNumberFormat
            value={sum_of_item_total_tax_included}
            className={" font-medium"}
            displayType={"text"}
            decimalScale={2}
            fixedDecimalScale={true}
          />
        </div>
      </div>
    </div>
  );
};

const ItemAddModal = ({ openModal, itemId, onClose }) => {
  return (
    <Dialog open={openModal} onOpenChange={onClose}>
      <DialogContent className="max-w-[900px] p-0 bg-background">
        <ItemAdd isModal={true} view_item_id={itemId} closeModal={onClose} />
      </DialogContent>
    </Dialog>
  );
};
export type { LineItemRowType };
