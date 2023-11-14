import { Button } from "@/components/ui/button.tsx";
import { Settings, Settings2Icon, SettingsIcon, Trash, X } from "lucide-react";
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
import ItemService, {
  Item,
  ItemCreatePayload,
  ItemEditPageContent,
  ItemFor,
} from "@/API/Resources/v1/Item/Item.Service.ts";
import LoaderComponent from "@/components/app/common/LoaderComponent.tsx";
import ReactSelectCRE from "react-select/creatable";
import {
  reactSelectComponentOverride,
  reactSelectStyle,
} from "@/util/style/reactSelectStyle.ts";
import { toast } from "@/components/ui/use-toast.ts";
import { DatePicker } from "@/components/ui/DatePicker.tsx";
import InvoiceService, {
  Invoice,
  InvoiceEditPageContent,
} from "@/API/Resources/v1/Invoice/Invoice.Service.ts";
import { PaymentTerm } from "@/API/Resources/v1/PaymentTerm.ts";
import { DateUtil } from "@/util/dateUtil.ts";

const invoiceService = new InvoiceService();

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

  const loadEditPage = useCallback(() => {
    invoiceService
      .getInvoiceEditPage({
        invoice_id: editInvoiceId,
      })
      .then((data) => {
        setEditPageContent(data!);
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  }, [editInvoiceId]);

  const unitsDropDownOptions = useMemo(() => {
    const units = editPageContent.units;
    return units.map((unit) => ({
      label: unit.unit,
      value: unit.unit,
      unit_id: unit.unit_id,
    }));
  }, [editPageContent]);
  const lineItemAccountsDropDown = useMemo(() => {
    return editPageContent.line_item_accounts_list.map((acc) => ({
      label: acc.account_name,
      value: acc.account_id,
      ...acc,
    }));
  }, [editPageContent.line_item_accounts_list]);

  const taxesDropDown = useMemo(() => {
    return editPageContent.taxes.map((acc) => ({
      label: `${acc.tax_name} [${acc.tax_percentage_formatted}%]`,
      value: acc.tax_id,
    }));
  }, [editPageContent.taxes]);

  const paymentTermsDropDown = useMemo(() => {
    return editPageContent.payment_terms.map((acc) => ({
      label: `${acc.name}`,
      value: acc.payment_term_id,
      is_default: acc.is_default,
      payment_term: acc.payment_term,
      interval: acc.interval,
    }));
  }, [editPageContent.payment_terms]);
  const defaultPaymentTerm = useMemo(
    () => paymentTermsDropDown.find((term) => term.is_default),
    [paymentTermsDropDown],
  );

  const handleCloseClick = () => {
    navigate("/app/invoices");
  };

  const basicSchema = z.object({
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
      value: z.number(),
      label: z.string(),
    }),
    due_date: z.date(),
  });

  const schema = basicSchema;
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {},
  });
  const { register, handleSubmit, watch, control, setValue } = form;
  const issue_date = watch("issue_date");

  const handlePaymentTermChange = (selectedOption: PaymentTerm) => {
    // depending on the payment term, set the due date
    const paymentTerm = selectedOption;
    const newDate = calculateDueDate({ issue_date, paymentTerm }).due_date;
    setValue("due_date", newDate);
  };

  const handleFormSubmit: SubmitHandler<z.infer<typeof schema>> = async (
    data,
  ) => {
    // let itemFor: ItemFor = "sales";
    // const newItem: ItemCreatePayload = {
    //   contact: data.contact,
    //   item_for: itemFor,
    // };
    // if (data.has_selling_price) {
    //   itemFor = "sales";
    //   newItem.selling_price = data.selling_price;
    //   newItem.selling_description = data.selling_description;
    //   newItem.sales_account_id = data.sales_account.value;
    // }
    // if (data.has_purchase_price) {
    //   itemFor = "purchase";
    //   newItem.purchase_price = data.purchase_price;
    //   newItem.purchase_description = data.purchase_description;
    //   newItem.purchase_account_id = data.purchase_account.value;
    // }
    // if (data.has_selling_price && data.has_purchase_price) {
    //   itemFor = "sales_and_purchase";
    // }
    // newItem.item_for = itemFor;
    //
    // if (isEditMode) {
    //   await invoiceService.updateItem({
    //     payload: newItem,
    //     params: {
    //       item_id: editInvoiceId,
    //     },
    //   });
    // } else {
    //   await invoiceService.addItem({
    //     payload: newItem,
    //   });
    // }
    //
    // // show a success message
    // const toastMessage = isEditMode
    //   ? "Item is updated successfully"
    //   : "Item is created successfully";
    // toast({
    //   title: "Success",
    //   description: toastMessage,
    // });
    // navigate("/app/inventory/items");
  };
  const setFormData = useCallback(
    (data: typeof editPageItemDetails) => {
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
                          <ReactSelectCRE
                            className={"col-span-3"}
                            options={unitsDropDownOptions}
                            {...field}
                            inputId={"contact"}
                            classNames={reactSelectStyle}
                            components={{
                              ...reactSelectComponentOverride,
                            }}
                            isClearable={true}
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
                            onChange={field.onChange}
                            id={"issue_date"}
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
                            <ReactSelectCRE
                              className={"col-span-3"}
                              options={paymentTermsDropDown}
                              {...field}
                              inputId={"payment_term"}
                              classNames={reactSelectStyle}
                              components={{
                                ...reactSelectComponentOverride,
                              }}
                              defaultValue={defaultPaymentTerm}
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
                              id={"due_date"}
                            />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                    control={control}
                  />
                </div>
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
