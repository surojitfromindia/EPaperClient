import { Button } from "@/components/ui/button.tsx";
import { Settings2Icon, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form.tsx";
import { SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input.tsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import LoaderComponent from "@/components/app/common/LoaderComponent.tsx";
import ReactSelect, { DropdownIndicatorProps, components } from "react-select";
import ReactAsyncSelect from "react-select/async";
import {
  reactSelectComponentOverride,
  reactSelectStyle,
} from "@/util/style/reactSelectStyle.ts";
import { DatePicker } from "@/components/ui/DatePicker.tsx";
import InvoiceService, {
  Invoice,
  InvoiceEditPageContent,
} from "@/API/Resources/v1/Invoice/Invoice.Service.ts";
import { PaymentTerm } from "@/API/Resources/v1/PaymentTerm.ts";
import { DateUtil } from "@/util/dateUtil.ts";
import AutoCompleteService from "@/API/Resources/v1/AutoComplete.Service.ts";
import { debounce } from "lodash";
import { Separator } from "@/components/ui/separator.tsx";

const invoiceService = new InvoiceService();
const autoCompleteService = new AutoCompleteService();

export default function InvoiceAdd() {
  const { invoice_id } = useParams();
  const editInvoiceId = useMemo(() => {
    //try to parse the number, check the return if NaN then return nothing from this memo
    const parseResult = Number.parseInt(invoice_id ?? "");
    if (!Number.isNaN(parseResult)) {
      return parseResult;
    }
  }, [invoice_id]);
  const isEditMode = useMemo(() => !!editInvoiceId, [editInvoiceId]);
  const submitButtonText = isEditMode ? "update" : "save";
  const pageHeaderText = isEditMode ? "update invoice" : "new invoice";

  const navigate = useNavigate();
  const [editPageItemDetails, setEditPageItemDetails] = useState<Invoice>();
  const [editPageContent, setEditPageContent] =
    useState<InvoiceEditPageContent>({
      taxes: [],
      units: [],
      payment_terms: [],
      line_item_accounts_list: [],
    });
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialContactLoadingDone, setIsInitialContactLoadingDone] =
    useState(false);
  const [contactDefaultList, setContactDefaultList] = useState<
    { label: string; value: number }[]
  >([]);
  const handleCloseClick = () => {
    navigate("/app/invoices");
  };

  const schema = z.object({
    contact: z.object(
      {
        value: z.number(),
        label: z.string(),
      },
      {
        invalid_type_error: "please select a customer",
        required_error: "please select a customer",
      },
    ),

    invoice_number: z.string().trim(),
    order_number: z.string().trim().optional(),
    issue_date: z.date(),
    payment_term: z.object({
      value: z.number().optional(),
      label: z.string(),
      is_custom: z.boolean().optional(),
    }),
    due_date: z.date(),
  });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {},
  });
  const { register, handleSubmit, watch, control, setValue } = form;
  const issue_date_watch_value = watch("issue_date");
  const payment_term_watch_value = watch("payment_term");

  const handleEditPageDetailsLoad = useCallback(
    (data: InvoiceEditPageContent) => {
      const paymentTerms = data.payment_terms;
      const defaultIssueDate = new Date();
      const defaultPaymentTerm = paymentTerms.find((term) => term.is_default);
      const defaultPaymentTermRSelect = {
        label: `${defaultPaymentTerm?.name}`,
        value: defaultPaymentTerm?.payment_term_id,
        is_default: defaultPaymentTerm?.is_default,
        payment_term: defaultPaymentTerm?.payment_term,
        interval: defaultPaymentTerm?.interval,
      };
      const defaultDueDate = calculateDueDate({
        issue_date: defaultIssueDate,
        paymentTerm: defaultPaymentTerm!,
      }).due_date;
      setValue("issue_date", defaultIssueDate);
      setValue("due_date", defaultDueDate);
      setValue("payment_term", defaultPaymentTermRSelect);
    },
    [setValue],
  );
  const loadEditPage = useCallback(() => {
    invoiceService
      .getInvoiceEditPage({
        invoice_id: editInvoiceId,
      })
      .then((data) => {
        setEditPageContent(data!);
        handleEditPageDetailsLoad(data);
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  }, [editInvoiceId, handleEditPageDetailsLoad]);
  const paymentTermsDropDown = useMemo(() => {
    const cratedPaymentTerms = editPageContent.payment_terms.map((acc) => ({
      label: `${acc.name}`,
      value: acc.payment_term_id,
      is_default: acc.is_default,
      payment_term: acc.payment_term,
      interval: acc.interval,
    }));
    const customPaymentTerms = {
      label: "Custom",
      is_custom: true,
      value: "",
    };
    return [...cratedPaymentTerms, customPaymentTerms];
  }, [editPageContent.payment_terms]);
  const taxesDropDown = useMemo(() => {
    return editPageContent.taxes.map((acc) => ({
      label: `${acc.tax_name} [${acc.tax_percentage_formatted}%]`,
      value: acc.tax_id,
    }));
  }, [editPageContent.taxes]);
  const handlePaymentTermChange = (selectedOption: PaymentTerm) => {
    if (selectedOption.is_custom) return;
    // depending on the payment term, set the due date
    const paymentTerm = selectedOption;
    const newDate = calculateDueDate({
      issue_date: issue_date_watch_value,
      paymentTerm,
    }).due_date;
    setValue("due_date", newDate);
  };
  const handleIssueDateChange = (date: Date) => {
    if (payment_term_watch_value.is_custom) return;

    // depending on the payment term, set the due date
    const newDate = calculateDueDate({
      issue_date: date,
      paymentTerm: payment_term_watch_value,
    }).due_date;
    setValue("due_date", newDate);
  };

  const contactAutoCompleteFetch = useCallback(async (search_text: string) => {
    const auto_complete_data = await autoCompleteService.getContacts({
      search_text: search_text,
      contact_type: "customer",
    });
    const { results } = auto_complete_data;
    return results.map((entry) => ({ label: entry.text, value: entry.id }));
  }, []);
  const handleContactAutoCompleteInitialFocus = useCallback(() => {
    if (isInitialContactLoadingDone) return;
    else {
      setIsInitialContactLoadingDone(true);
      contactAutoCompleteFetch("")
        .then((data) => {
          setContactDefaultList(data);
        })
        .catch((error) => console.log(error));
    }
  }, [contactAutoCompleteFetch, isInitialContactLoadingDone]);

  const handleContactAutoCompleteChange = useCallback(
    (search_text: string, callback) => {
      contactAutoCompleteFetch(search_text).then((data) => callback(data));
    },
    [contactAutoCompleteFetch],
  );

  const handleFormSubmit: SubmitHandler<z.infer<typeof schema>> = async (
    data,
  ) => {};
  const setFormData = useCallback((data: typeof editPageItemDetails) => {
    // reset the defaults when update
    // setValue("has_selling_price", false);
    // setValue("has_purchase_price", false);
    //
    // if (data) {
    //   setValue("name", data.name!);
    //   setValue("product_type", data.product_type!);
    //   setValue("tax", {
    //     label: `${data.tax_name} [${data.tax_percentage!}%]`,
    //     value: data.tax_id!,
    //   });
    //   setValue("selling_price", data.selling_price!);
    //   setValue("purchase_price", data.purchase_price!);
    //
    //   if (data.unit_id && data.unit) {
    //     setValue("unit", { label: data.unit!, value: data.unit! });
    //   }
    //   if (
    //     data?.item_for === "sales_and_purchase" ||
    //     data?.item_for === "sales"
    //   ) {
    //     setValue("has_selling_price", true);
    //     setValue("sales_account", {
    //       label: data?.sales_account_name ?? "",
    //       value: data.sales_account_id!,
    //       account_name: data?.sales_account_name ?? "",
    //     });
    //     setValue("selling_description", data.selling_description);
    //   }
    //   if (
    //     data?.item_for === "sales_and_purchase" ||
    //     data?.item_for === "purchase"
    //   ) {
    //     setValue("has_purchase_price", true);
    //     setValue("purchase_account", {
    //       label: data?.purchase_account_name ?? "",
    //       value: data.purchase_account_id!,
    //       account_name: data?.purchase_account_name ?? "",
    //     });
    //     setValue("purchase_description", data.purchase_description);
    //   }
    // }
  }, []);

  // effects
  useEffect(() => {
    loadEditPage();
    return () => {
      invoiceService.abortGetRequest();
    };
  }, [loadEditPage]);
  useEffect(() => {
    if (editPageItemDetails) {
      setFormData(editPageItemDetails);
    }
  }, [editPageItemDetails, setFormData]);

  if (isLoading) {
    return (
      <div className={"relative h-screen w-full"}>
        <LoaderComponent />
      </div>
    );
  }
  return (
    <div className={"flex flex-col h-screen max-h-screen  justify-between"}>
      <div className={"flex-grow overflow-y-auto"}>
        <div
          className={
            "px-5 pl-3 pr-2 py-3 shadow-sm flex justify-between items-center"
          }
        >
          <span className={"text-2xl capitalize"}>{pageHeaderText}</span>
          <span>
            <Button variant={"ghost"} onClick={handleCloseClick}>
              <X className={"w-4 h-4"} />
            </Button>
          </span>
        </div>
        <Form {...form}>
          <form>
            <div className={"grid py-4 md:grid-cols-12 grid-cols-6 p-5 my-6"}>
              <div className={"md:grid-cols-4 col-span-5 space-y-2.5"}>
                <FormField
                  name={"contact"}
                  render={({ field }) => (
                    <FormItem className={"grid grid-cols-4 items-center "}>
                      <FormLabel htmlFor={"contact"} className=" capitalize">
                        Customer
                      </FormLabel>
                      <div className="col-span-3 flex-col">
                        <FormControl>
                          <ReactAsyncSelect
                            onFocus={handleContactAutoCompleteInitialFocus}
                            className={"col-span-3"}
                            loadOptions={debounce(
                              handleContactAutoCompleteChange,
                              600,
                            )}
                            defaultOptions={contactDefaultList}
                            {...field}
                            inputId={"contact"}
                            classNames={reactSelectStyle}
                            components={{
                              ...reactSelectComponentOverride,
                            }}
                            cacheOptions={true}
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                  control={control}
                />

                <FormField
                  name={"invoice_number"}
                  render={() => (
                    <FormItem className={"grid grid-cols-4 items-center "}>
                      <FormLabel
                        htmlFor={"invoice_number"}
                        className={"capitalize"}
                      >
                        Invoice#
                      </FormLabel>
                      <div className="col-span-3 flex-col">
                        <FormControl>
                          <div className="relative w-full max-w-sm">
                            <Input
                              className="pr-10 col-span-3"
                              placeholder="Invoice number"
                              type="text"
                              id="invoice_number"
                              {...register("invoice_number")}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                              <Settings2Icon
                                className={"w-4 h-4 text-primary"}
                              />
                            </div>
                          </div>
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  name={"issue_date"}
                  render={({ field }) => (
                    <FormItem className={"grid grid-cols-4 items-center "}>
                      <FormLabel htmlFor={"issue_date"} className=" capitalize">
                        Issue Date
                      </FormLabel>
                      <div className="col-span-3 flex-col">
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={(value: Date) => {
                              handleIssueDateChange(value);
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                  control={control}
                />
              </div>

              <div
                className={"grid grid-cols-12 col-span-12 space-x-5 mt-2.5 "}
              >
                <div className={"col-span-5"}>
                  <FormField
                    name={"payment_term"}
                    render={({ field }) => (
                      <FormItem className={"grid grid-cols-4 items-center "}>
                        <FormLabel
                          htmlFor={"payment_term"}
                          className=" capitalize"
                        >
                          Terms
                        </FormLabel>
                        <div className="col-span-3 flex-col">
                          <FormControl>
                            <ReactSelect
                              className={"col-span-3"}
                              options={paymentTermsDropDown}
                              {...field}
                              inputId={"payment_term"}
                              classNames={reactSelectStyle}
                              components={{
                                ...reactSelectComponentOverride,
                              }}
                              value={field.value}
                              onChange={(value: PaymentTerm) => {
                                handlePaymentTermChange(value);
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                    control={control}
                  />
                </div>
                <div className={"col-span-4"}>
                  <FormField
                    name={"due_date"}
                    render={({ field }) => (
                      <FormItem className={"grid grid-cols-4 items-center "}>
                        <FormLabel htmlFor={"due_date"} className=" capitalize">
                          Due Date
                        </FormLabel>
                        <div className="col-span-3 flex-col">
                          <FormControl>
                            <DatePicker
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                    control={control}
                  />
                </div>
              </div>

              <Separator className={"col-span-12 my-5"} />
              <div className={"mt-5 flex flex-col space-y-6 col-span-12"}>
                <LineItemInputTable
                  taxesDropDown={taxesDropDown}
                  itemFor={"sales"}
                />
              </div>
            </div>

            <div className={"h-32"}></div>
          </form>
        </Form>
      </div>
      <div className={"h-16 mb-12 py-2 px-5 flex space-x-2 border-t-1 "}>
        <Button
          className={"capitalize"}
          onClick={handleSubmit(handleFormSubmit)}
        >
          {submitButtonText}
        </Button>
        <Button
          className={"capitalize"}
          variant={"outline"}
          onClick={handleCloseClick}
        >
          cancel
        </Button>
      </div>
    </div>
  );
}

function calculateDueDate({ issue_date, paymentTerm }) {
  // depending to "interval" type if regular just use regular calculation
  const interval = paymentTerm.interval;
  const pt = paymentTerm.payment_term;
  const dateCalculator = DateUtil.Calculator(issue_date);
  let date: Date;
  switch (interval) {
    case "regular": {
      date = dateCalculator.addDays(pt).getDate();
      break;
    }
    case "end_of_month": {
      date = dateCalculator.endOfFewMonths(pt).getDate();
      break;
    }
    case "end_of_day": {
      date = dateCalculator.endOfCurrentDay().getDate();
      break;
    }
  }
  return { due_date: date };
}

import {
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  TableBody,
  Table,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea.tsx";
import ItemService from "@/API/Resources/v1/Item/Item.Service.ts";
const itemService = new ItemService();

function LineItemInputTable({ taxesDropDown, itemFor, line_items = [] }) {
  const BLANK_ROW = {
    item: null,
    unit: "",
    description: "",
    quantity: 1,
    price: 0,
    discount: 0,
    tax: null,
    total: 0,
  };
  const [lineItems, setLineItems] = useState([BLANK_ROW]);

  useEffect(() => {
    if (line_items.length > 0) setLineItems(line_items);
  }, [line_items]);

  const [isInitialItemLoadingDone, setIsInitialItemLoadingDone] =
    useState(false);
  const [itemDefaultList, setItemDefaultList] = useState<
    { label: string; value: number }[]
  >([]);

  const itemAutoCompleteFetch = useCallback(async (search_text: string) => {
    const auto_complete_data = await autoCompleteService.getItems({
      search_text: search_text,
      item_for: itemFor,
    });
    const { results } = auto_complete_data;
    return results.map((entry) => ({ label: entry.text, value: entry.id }));
  }, [itemFor]);
  const handleItemAutoCompleteInitialFocus = useCallback(() => {
    if (isInitialItemLoadingDone) return;
    else {
      setIsInitialItemLoadingDone(true);
      itemAutoCompleteFetch("")
        .then((data) => {
          setItemDefaultList(data);
        })
        .catch((error) => console.log(error));
    }
  }, [itemAutoCompleteFetch, isInitialItemLoadingDone]);
  const handleItemAutoCompleteChange = useCallback(
    (search_text: string, callback) => {
      itemAutoCompleteFetch(search_text).then((data) => callback(data));
    },
    [itemAutoCompleteFetch],
  );

  const handleItemSelect = (item_id: number, index: number) => {
    console.log("item id", item_id);
    const temp_line_item = [...lineItems];
    if (!item_id) {
      temp_line_item[index] = BLANK_ROW;
      setLineItems([...temp_line_item]);
      return;
    }
    // do an item api call.
    itemService
      .getItem({
        item_id,
      })
      .then((data) => {
        const fetched_item = data.item;
        setLineItems((items) =>
          items.map((item, item_index) => {
            if (item_index === index) {
              item.price =
                itemFor === "sales"
                  ? fetched_item.selling_price
                  : fetched_item.purchase_price;
              item.description =
                itemFor === "sales"
                  ? fetched_item.selling_description
                  : fetched_item.purchase_description;
              item.tax = {
                label: fetched_item.tax_name,
                value: fetched_item.tax_id,
                tax_percentage: fetched_item.tax_percentage,
              };
              item.item = {
                label: fetched_item.name,
                value: fetched_item.item_id,
              };
              return item;
            }
            return item;
          }),
        );
      })
      .catch((error) => console.log(error));
  };
  return (
    <div className={"flex flex-col space-y-3 col-span-12"}>
      <ReactSelect
        className={"w-[150px]"}
        classNames={reactSelectStyle}
        components={{
          ...reactSelectComponentOverride,
        }}
        placeholder={"Tax treatment"}
        options={[
          { label: "Tax Inclusive", value: "true" },
          { label: "Tax Exclusive", value: "false" },
        ]}
        isSearchable={false}
      />
      <Table className="divide-y  divide-gray-200 border-y border-gray-300">
        <TableHeader>
          <TableRow className="divide-x divide-gray-200  ">
            <TableHead className="w-[380px] px-4 py-1 text-xs">item</TableHead>
            <TableHead className="w-[100px] px-4 py-1 text-xs">
              quantity
            </TableHead>
            <TableHead className="w-[100px] px-4 py-1 text-xs">rate</TableHead>
            <TableHead className="w-[100px] px-4 py-1 text-xs">
              discount
            </TableHead>
            <TableHead className="w-[170px] px-4 py-1 text-xs">
              tax (%)
            </TableHead>
            <TableHead className="text-right px-4 py-1 text-xs">
              amount
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lineItems.map((lineItem, index) => (
            <TableRow
              key={index}
              className="divide-x divide-gray-200 hover:bg-none!impotant"
            >
              <TableCell className="px-1 py-1">
                <div className="w-full flex flex-col space-y-2" id="item-1">
                  <ReactAsyncSelect
                    className={"w-full"}
                    defaultOptions={itemDefaultList}
                    inputId={"item"}
                    loadOptions={handleItemAutoCompleteChange}
                    onFocus={handleItemAutoCompleteInitialFocus}
                    placeholder="Type or select an item"
                    classNames={reactSelectStyle}
                    components={{
                      ...reactSelectComponentOverride,
                    }}
                    menuPortalTarget={document.body}
                    isClearable={true}
                    value={lineItem.item}
                    onChange={(e_value) => {
                      handleItemSelect(e_value ? e_value.value : null, index);
                    }}
                  />
                  {lineItem.item && (
                    <Textarea
                      className="w-full min-h-[50px]"
                      placeholder="Item Description"
                      value={lineItem.description}
                    />
                  )}
                </div>
              </TableCell>
              <TableCell className="px-1 py-1 align-top">
                <div>
                  <Input
                    className="w-full border-0 text-right"
                    id="quantity-1"
                    value={1.0}
                  />
                </div>
              </TableCell>
              <TableCell className="px-1 py-1 align-top">
                <div>
                  <Input
                    className="w-full border-0 text-right"
                    id="price-1"
                    value={lineItem.price}
                  />
                </div>
              </TableCell>
              <TableCell className="px-1 py-1 align-top">
                <div>
                  <Input
                    className="w-full border-0 text-right"
                    id="price-1"
                    value={0.0}
                  />
                </div>
              </TableCell>
              <TableCell className="px-1 py-1 align-top">
                <div>
                  <ReactSelect
                    className={"w-full z-100"}
                    options={taxesDropDown}
                    inputId={"tax"}
                    placeholder={"Select tax"}
                    classNames={reactSelectStyle}
                    components={{
                      ...reactSelectComponentOverride,
                      DropdownIndicator: (props: DropdownIndicatorProps) => {
                        if (props.selectProps.value) {
                          return null; // Return null to not display anything when a value is selected
                        }
                        return <components.DropdownIndicator {...props} />;
                      },
                    }}
                    menuPortalTarget={document.body}
                    isClearable={true}
                    value={lineItem.tax}
                  />
                </div>
              </TableCell>
              <TableCell className="text-right px-1 py-1 align-top">
                <div>0</div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
