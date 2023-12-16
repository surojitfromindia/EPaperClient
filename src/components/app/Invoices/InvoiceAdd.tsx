import { Button } from "@/components/ui/button.tsx";
import { Loader2, Settings2Icon, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form.tsx";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input.tsx";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import LoaderComponent from "@/components/app/common/LoaderComponent.tsx";
import ReactSelect from "react-select";
import ReactAsyncSelect from "react-select/async";
import {
  reactSelectComponentOverride,
  reactSelectStyle,
} from "@/util/style/reactSelectStyle.ts";
import InvoiceService, {
  Invoice,
  InvoiceEditPageContent,
} from "@/API/Resources/v1/Invoice/Invoice.Service.ts";
import { PaymentTerm } from "@/API/Resources/v1/PaymentTerm.ts";
import { DateUtil } from "@/util/dateUtil.ts";
import AutoCompleteService from "@/API/Resources/v1/AutoComplete.Service.ts";
import { debounce } from "lodash";
import { Separator } from "@/components/ui/separator.tsx";
import {
  LineItemInputTable,
  LineItemRowType,
} from "@/components/app/common/LineItemInputTable.tsx";
import { FormValidationErrorAlert } from "@/components/app/common/FormValidationErrorAlert.tsx";
import {
  invoiceLineItemRowToPayloadDTO,
  invoiceLineItemSchema,
} from "@/components/app/common/ValidationSchemas/InvoiceLineItemSchema.ts";
import { InvoiceCreationPayloadType } from "@/API/Resources/v1/Invoice/InvoiceCreationPayloadTypes";
import { toast } from "@/components/ui/use-toast.ts";
import { WrappedError } from "@/API/Resources/v1/APIAxiosConfig.ts";
import { ValidityUtil } from "@/util/ValidityUtil.ts";
import { Contact } from "@/API/Resources/v1/Contact/Contact.Service.ts";
import { ReactHookFormUtil } from "@/util/reactHookFormUtil.ts";
import { Badge } from "@/components/ui/badge.tsx";

const invoiceService = new InvoiceService();
const autoCompleteService = new AutoCompleteService();
const CUSTOM_PAYMENT_TERM = {
  label: "CUSTOM",
  is_custom: true,
  value: -1,
};

const schema = z.object({
  contact: z.object(
    {
      value: z.number(),
      label: z.string(),
    },
    {
      invalid_type_error: "Please select a customer",
      required_error: "Please select a customer",
    },
  ),
  is_inclusive_tax: z.boolean(),
  invoice_number: z.string().trim().nonempty("Please enter an invoice number"),
  order_number: z.string().trim().optional(),
  issue_date: z.date(),
  payment_term: z.object({
    value: z.number(),
    label: z.string().nullable(),
    is_custom: z.boolean().optional().nullable(),
    payment_term: z.number().optional().nullable(),
    interval: z.string().optional().nullable(),
  }),
  due_date: z.date(),
  line_items: z.array(invoiceLineItemSchema),
  notes: z.string().optional().nullable(),
  exchange_rate: z.number().optional().nullable(),
});
const defaultIssueDate = new Date();

const mapPaymentTermToRSelect = (paymentTerm: PaymentTerm) => ({
  label: `${paymentTerm.payment_term_name}`,
  value: paymentTerm.payment_term_id,
  is_default: paymentTerm.is_default,
  payment_term: paymentTerm.payment_term,
  interval: paymentTerm.interval,
});

export default function InvoiceAdd() {
  const { invoice_id_param } = useParams();
  const editInvoiceId = useMemo(() => {
    //try to parse the number, check the return if NaN then return nothing from this memo
    const parseResult = Number.parseInt(invoice_id_param ?? "");
    if (!Number.isNaN(parseResult)) {
      return parseResult;
    }
  }, [invoice_id_param]);
  const isEditMode = useMemo(() => !!editInvoiceId, [editInvoiceId]);
  const submitButtonText = isEditMode ? "update" : "save";
  const pageHeaderText = isEditMode ? "update invoice" : "new invoice";
  const navigate = useNavigate();

  // edit page states
  const [editPageInvoiceDetails, setEditPageInvoiceDetails] =
    useState<Invoice>();
  const [contactDetails, setContactDetails] = useState<Contact>();
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [editPageContent, setEditPageContent] =
    useState<InvoiceEditPageContent>({
      taxes: [],
      units: [],
      payment_terms: [],
      line_item_accounts_list: [],
    });

  // loading states
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isInitialContactLoadingDone, setIsInitialContactLoadingDone] =
    useState<boolean>(false);
  const [isSavingActionInProgress, setIsSavingActionInProgress] =
    useState<boolean>(false);

  // default values for contact autocomplete
  const [contactDefaultList, setContactDefaultList] = useState<
    { label: string; value: number }[]
  >([]);

  // error messages
  const [errorMessagesForBanner, setErrorMessagesForBanner] = useState<
    string[]
  >([]);

  const handleCloseClick = () => {
    navigate("/app/invoices");
  };

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      payment_term: CUSTOM_PAYMENT_TERM,
    },
  });
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    getValues,
  } = form;

  const handleEditPageDetailsLoad = useCallback(
    (data: InvoiceEditPageContent) => {
      const paymentTerms = data.payment_terms;
      const defaultPaymentTerm = paymentTerms.find((term) => term.is_default);
      const defaultPaymentTermRSelect = mapPaymentTermToRSelect(
        defaultPaymentTerm!,
      );
      const defaultDueDate = calculateDueDate({
        issue_date: defaultIssueDate,
        paymentTerm: defaultPaymentTerm!,
      }).due_date;

      if (isEditMode) return;
      setValue("issue_date", defaultIssueDate);
      setValue("due_date", defaultDueDate);
      setValue("payment_term", defaultPaymentTermRSelect);
    },
    [isEditMode, setValue],
  );
  const loadEditPage = useCallback(() => {
    invoiceService
      .getInvoiceEditPage({
        invoice_id: editInvoiceId,
      })
      .then((data) => {
        if (ValidityUtil.isNotEmpty(data.invoice)) {
          setFormData(data?.invoice);
          setEditPageInvoiceDetails(data?.invoice);
          setExchangeRate(data?.invoice?.exchange_rate ?? 1);
        }
        if (ValidityUtil.isNotEmpty(data.contact)) {
          setContactDetails(data?.contact);
        }

        setEditPageContent(data!);
        handleEditPageDetailsLoad(data);
      })
      .catch((error) => console.log(error))
      .finally(() => setIsInitialLoading(false));
  }, [editInvoiceId]);

  // ----------------- dropdowns -----------------
  const paymentTermsDropDown = useMemo(() => {
    const cratedPaymentTerms = editPageContent.payment_terms.map(
      mapPaymentTermToRSelect,
    );
    return [...cratedPaymentTerms, CUSTOM_PAYMENT_TERM];
  }, [editPageContent.payment_terms]);
  const taxesDropDown = useMemo(() => {
    return editPageContent.taxes.map((acc) => ({
      label: `${acc.tax_name} [${acc.tax_percentage}%]`,
      value: acc.tax_id,
      tax_percentage: acc.tax_percentage,
    }));
  }, [editPageContent.taxes]);

  // ----------------- event handlers -----------------
  const handlePaymentTermChange = useCallback(
    (selectedOption: PaymentTerm) => {
      const issue_date_watch_value = getValues("issue_date");
      if (selectedOption.is_custom) return;
      // depending on the payment term, set the due date
      const paymentTerm = selectedOption;
      const newDate = calculateDueDate({
        issue_date: issue_date_watch_value,
        paymentTerm,
      }).due_date;
      setValue("due_date", newDate);
    },
    [getValues, setValue],
  );
  const handleIssueDateChange = (date: Date) => {
    const payment_term_watch_value = getValues("payment_term");
    if (payment_term_watch_value.is_custom) return;

    // depending on the payment term, set the due date
    const newDate = calculateDueDate({
      issue_date: date,
      paymentTerm: payment_term_watch_value,
    }).due_date;
    setValue("due_date", newDate);
  };
  const handleDueDateChange = (date: Date) => {
    setValue("due_date", date);
    // on due date manual change, set the payment term to custom
    setValue("payment_term", {
      label: "CUSTOM",
      is_custom: true,
      value: -1,
    });
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
    (
      search_text: string,
      callback: (arg0: { label: string; value: number }[]) => void,
    ) => {
      contactAutoCompleteFetch(search_text).then((data) => callback(data));
    },
    [contactAutoCompleteFetch],
  );

  const handleLineItemsUpdate = useCallback(
    ({
      line_items,
      is_inclusive_tax,
      exchange_rate,
    }: {
      line_items: LineItemRowType[];
      is_inclusive_tax: boolean;
      exchange_rate: number;
    }) => {
      setValue("is_inclusive_tax", is_inclusive_tax);
      setValue("line_items", line_items);
      setValue("exchange_rate", exchange_rate);
    },
    [setValue],
  );

  const handleContactChange = useCallback(
    (contact_id: number) => {
      if (contact_id)
        invoiceService
          .getInvoiceEditPageFromContact({
            contact_id: contact_id,
          })
          .then((data) => {
            const contact = data.contact;
            setContactDetails(contact);

            // update exchange rate if the currency is different
            if (contact.currency_code !== contactDetails?.currency_code) {
              setExchangeRate(1);
            }

            // update the payment term using the contact payment term
            const contactPaymentTerm = editPageContent.payment_terms.find(
              (term) => term.payment_term_id === contact.payment_term_id,
            );
            const defaultDueDate = calculateDueDate({
              issue_date: getValues("issue_date"),
              paymentTerm: contactPaymentTerm!,
            }).due_date;
            handlePaymentTermChange(contactPaymentTerm!);
            setValue("due_date", defaultDueDate);
            setValue(
              "payment_term",
              mapPaymentTermToRSelect(contactPaymentTerm!),
            );
          });
    },
    [
      contactDetails?.currency_code,
      editPageContent.payment_terms,
      getValues,
      handlePaymentTermChange,
      setValue,
    ],
  );
  const handleOnlyExchangeRateChange = useCallback(
    (exchange_rate: number) => {
      setValue("exchange_rate", exchange_rate);
    },
    [setValue],
  );

  const handleFormSubmit = async (
    data: z.infer<typeof schema>,
    _event?: React.BaseSyntheticEvent,
    with_status: "draft" | "sent" = "draft",
  ) => {
    try {
      const toastMessage = isEditMode
        ? "Invoice is updated successfully"
        : "Invoice is created successfully";
      setIsSavingActionInProgress(true);
      const newInvoice: InvoiceCreationPayloadType = {
        contact_id: data.contact.value,
        invoice_number: data.invoice_number,
        issue_date: data.issue_date,
        due_date: data.due_date,
        payment_term_id: data.payment_term.value,
        is_inclusive_tax: data.is_inclusive_tax,
        line_items: data.line_items.map(invoiceLineItemRowToPayloadDTO),
        notes: data.notes,
        transaction_status: with_status,
        exchange_rate: data.exchange_rate,
      };
      if (isEditMode) {
        await invoiceService
          .updateInvoice({
            payload: newInvoice,
            invoice_id: editInvoiceId,
          })
          .then(() => {
            toast({
              title: "Success",
              description: toastMessage,
            });
            navigate("/app/invoices");
          })
          .catch((error: WrappedError) => {
            setErrorMessagesForBanner([error.message]);
          });
      } else {
        await invoiceService
          .addInvoice({
            payload: newInvoice,
          })
          .then(() => {
            toast({
              title: "Success",
              description: toastMessage,
            });
            navigate("/app/invoices");
          })
          .catch((error: WrappedError) => {
            setErrorMessagesForBanner([error.message]);
          });
      }
    } catch (error) {
      setErrorMessagesForBanner([error.message]);
    } finally {
      setIsSavingActionInProgress(false);
    }
  };
  const setFormData = useCallback(
    (data: typeof editPageInvoiceDetails) => {
      setValue("contact", {
        label: data.contact_name,
        value: data.contact_id,
      });
      setValue("invoice_number", data.invoice_number);
      setValue("issue_date", new Date(data.issue_date));
      setValue("payment_term", {
        label: data.payment_term_name,
        value: data.payment_term_id,
        payment_term: data.payment_term,
        interval: data.payment_term_interval,
        is_custom: data.payment_term_id === CUSTOM_PAYMENT_TERM.value,
      });
      setValue("due_date", new Date(data.due_date));
      setValue("is_inclusive_tax", data.is_inclusive_tax);
      setValue("line_items", data.line_items);
      setValue("notes", data.notes);
      setValue("exchange_rate", data.exchange_rate);
    },
    [setValue],
  );

  // effects
  useEffect(() => {
    loadEditPage();
    return () => {
      invoiceService.abortGetRequest();
    };
  }, [loadEditPage]);

  // update the error message banner
  useEffect(() => {
    if (errors) {
      setErrorMessagesForBanner(
        ReactHookFormUtil.deepFlatReactHookFormErrorOnlyMessage(errors),
      );
    }
  }, [errors]);

  if (isInitialLoading) {
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
        <div className={"px-5"}>
          <FormValidationErrorAlert messages={errorMessagesForBanner} />
        </div>
        <Form {...form}>
          <form>
            <div className={"grid py-4 md:grid-cols-12 grid-cols-6 p-5 my-6"}>
              <div className={"md:grid-cols-4 col-span-5 space-y-2.5"}>
                <div>
                  <FormField
                    name={"contact"}
                    render={({ field }) => (
                      <FormItem className={"grid grid-cols-4  items-baseline "}>
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
                              onChange={(value: {
                                label: string;
                                value: number;
                              }) => {
                                field.onChange(value);
                                handleContactChange(value.value);
                              }}
                              inputId={"contact"}
                              classNames={reactSelectStyle}
                              components={{
                                ...reactSelectComponentOverride,
                              }}
                              cacheOptions={true}
                            />
                          </FormControl>
                          {ValidityUtil.isNotEmpty(contactDetails) && (
                            <Badge
                              className={
                                "text-[10px] px-1 py-0.5 rounded-sm capitalize"
                              }
                            >
                              {contactDetails?.currency_code}
                            </Badge>
                          )}
                        </div>
                      </FormItem>
                    )}
                    control={control}
                  />
                </div>
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
                          <Input
                            type={"date"}
                            {...field}
                            id={"issue_date"}
                            value={DateUtil.Formatter(field.value).format(
                              "yyyy-MM-dd",
                            )}
                            onChange={(e) => {
                              handleIssueDateChange(new Date(e.target.value));
                              field.onChange(new Date(e.target.value));
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
                            <Input
                              type={"date"}
                              {...field}
                              id={"due_date"}
                              value={DateUtil.Formatter(field.value).format(
                                "yyyy-MM-dd",
                              )}
                              onChange={(e) => {
                                handleDueDateChange(new Date(e.target.value));
                                field.onChange(new Date(e.target.value));
                              }}
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
                  onLineItemsUpdate={handleLineItemsUpdate}
                  isCreateMode={!isEditMode}
                  line_items={editPageInvoiceDetails?.line_items ?? []}
                  isTransactionInclusiveTax={getValues("is_inclusive_tax")}
                  contactDetails={contactDetails}
                  transactionExchangeRate={exchangeRate}
                  onOnlyExchangeRateChange={handleOnlyExchangeRateChange}
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
          onClick={handleSubmit((data) =>
            handleFormSubmit(data, undefined, "draft"),
          )}
        >
          {isSavingActionInProgress && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
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
