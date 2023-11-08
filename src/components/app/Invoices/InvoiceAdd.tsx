import { Button } from "@/components/ui/button.tsx";
import { Trash, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input.tsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
import ItemService, {
  Item,
  ItemCreatePayload,
  ItemEditPageContent,
  ItemFor,
} from "@/API/Resources/v1/Item/Item.Service.ts";
import LoaderComponent from "@/components/app/common/LoaderComponent.tsx";
import ReactSelect, { components, OptionProps } from "react-select";
import ReactSelectCRE from "react-select/creatable";
import {
  reactSelectComponentOverride,
  reactSelectStyle,
} from "@/util/style/reactSelectStyle.ts";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { formatOptionLabelOfAccounts } from "@/components/app/common/FormatAccountsLabel.tsx";
import RNumberFormat from "@/components/app/common/RNumberFormat.tsx";
import { toast } from "@/components/ui/use-toast.ts";

const itemService = new ItemService();

export default function InvoiceAdd() {
  const { item_id } = useParams();
  const editItemId = useMemo(() => {
    //try to parse the number, check the return if NaN then return nothing from this memo
    const parseResult = Number.parseInt(item_id ?? "");
    if (!Number.isNaN(parseResult)) {
      return parseResult;
    }
  }, [item_id]);
  const isEditMode = useMemo(() => !!editItemId, [editItemId]);
  const submitButtonText = isEditMode ? "update" : "save";
  const pageHeaderText = isEditMode ? "update invoice" : "new invoice";

  const navigate = useNavigate();
  const [editPageItemDetails, setEditPageItemDetails] = useState<Item>();
  const [editPageContent, setEditPageContent] = useState<ItemEditPageContent>({
    inventory_accounts_list: [],
    purchase_accounts_list: [],
    taxes: [],
    units: [],
    income_accounts_list: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadEditPage = useCallback(() => {
    itemService
      .getItemEditPage({
        item_id: editItemId,
      })
      .then((data) => {
        setEditPageContent(data!);
        setEditPageItemDetails(data?.item);
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  }, [editItemId]);

  const unitsDropDownOptions = useMemo(() => {
    const units = editPageContent.units;
    return units.map((unit) => ({
      label: unit.unit,
      value: unit.unit,
      unit_id: unit.unit_id,
    }));
  }, [editPageContent]);
  const incomeAccountsDropDown = useMemo(() => {
    return editPageContent.income_accounts_list.map((acc) => ({
      label: acc.account_name,
      value: acc.account_id,
      ...acc,
    }));
  }, [editPageContent.income_accounts_list]);
  const purchaseAccountsDropDown = useMemo(() => {
    return editPageContent.purchase_accounts_list.map((acc) => ({
      label: acc.account_name,
      value: acc.account_id,
      ...acc,
    }));
  }, [editPageContent.purchase_accounts_list]);
  const taxesDropDown = useMemo(() => {
    return editPageContent.taxes.map((acc) => ({
      label: `${acc.tax_name} [${acc.tax_percentage_formatted}%]`,
      value: acc.tax_id,
    }));
  }, [editPageContent.taxes]);
  const handleCloseClick = () => {
    navigate("/app/invoices");
  };

  const basicSchema = z
    .object({
      contact: z.object(
        {
          value: z.number(),
          label: z.string()
        },
        {
          invalid_type_error: "please select a customer",
          required_error: "please select a customer",
        },
      ),

      invoice_number: z.string().trim(),
      order_number: z.string().trim().optional(),

    })
  const hasSellingInformationSchema = z.object({
    has_selling_price: z.literal(true),
    selling_price: z.number({ required_error: "enter selling price" }),
    sales_account: z.object(
      { value: z.number(), label: z.string(), account_name: z.string() },
      {
        invalid_type_error: "select an account",
        required_error: "select an account",
      },
    ),
    selling_description: z.string().optional(),
  });
  const hasNoSellingInformationSchema = z.object({
    has_selling_price: z.literal(false),
  });
  const hasPurchaseInformation = z.object({
    has_purchase_price: z.literal(true),
    purchase_price: z.number({ required_error: "enter purchase price" }),
    purchase_account: z.object(
      { value: z.number(), label: z.string(), account_name: z.string() },
      {
        invalid_type_error: "select an account",
        required_error: "select an account",
      },
    ),
    purchase_description: z.string().optional(),
  });
  const hasNoPurchaseInformation = z.object({
    has_purchase_price: z.literal(false),
  });
  const schema = basicSchema
    .and(
      z.discriminatedUnion("has_selling_price", [
        hasSellingInformationSchema,
        hasNoSellingInformationSchema,
      ]),
    )
    .and(
      z.discriminatedUnion("has_purchase_price", [
        hasPurchaseInformation,
        hasNoPurchaseInformation,
      ]),
    );
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {

    },
  });
  const { register, handleSubmit, watch, control, setValue } = form;
  const has_selling_price = watch("has_selling_price");
  const has_purchase_price = watch("has_purchase_price");

  const handleFormSubmit: SubmitHandler<z.infer<typeof schema>> = async (
    data,
  ) => {
    let itemFor: ItemFor = "sales";
    const newItem: ItemCreatePayload = {
      contact: data.contact,
      item_for: itemFor,
    };
    if (data.has_selling_price) {
      itemFor = "sales";
      newItem.selling_price = data.selling_price;
      newItem.selling_description = data.selling_description;
      newItem.sales_account_id = data.sales_account.value;
    }
    if (data.has_purchase_price) {
      itemFor = "purchase";
      newItem.purchase_price = data.purchase_price;
      newItem.purchase_description = data.purchase_description;
      newItem.purchase_account_id = data.purchase_account.value;
    }
    if (data.has_selling_price && data.has_purchase_price) {
      itemFor = "sales_and_purchase";
    }
    newItem.item_for = itemFor;

    if (isEditMode) {
      await itemService.updateItem({
        payload: newItem,
        params: {
          item_id: editItemId,
        },
      });
    } else {
      await itemService.addItem({
        payload: newItem,
      });
    }

    // show a success message
    const toastMessage = isEditMode
      ? "Item is updated successfully"
      : "Item is created successfully";
    toast({
      title: "Success",
      description: toastMessage,
    });
    navigate("/app/inventory/items");
  };
  const setFormData = useCallback(
    (data: typeof editPageItemDetails) => {
      // reset the defaults when update
      setValue("has_selling_price", false);
      setValue("has_purchase_price", false);

      if (data) {
        setValue("name", data.name!);
        setValue("product_type", data.product_type!);
        setValue("tax", {
          label: `${data.tax_name} [${data.tax_percentage!}%]`,
          value: data.tax_id!,
        });
        setValue("selling_price", data.selling_price!);
        setValue("purchase_price", data.purchase_price!);

        if (data.unit_id && data.unit) {
          setValue("unit", { label: data.unit!, value: data.unit! });
        }
        if (
          data?.item_for === "sales_and_purchase" ||
          data?.item_for === "sales"
        ) {
          setValue("has_selling_price", true);
          setValue("sales_account", {
            label: data?.sales_account_name ?? "",
            value: data.sales_account_id!,
            account_name: data?.sales_account_name ?? "",
          });
          setValue("selling_description", data.selling_description);
        }
        if (
          data?.item_for === "sales_and_purchase" ||
          data?.item_for === "purchase"
        ) {
          setValue("has_purchase_price", true);
          setValue("purchase_account", {
            label: data?.purchase_account_name ?? "",
            value: data.purchase_account_id!,
            account_name: data?.purchase_account_name ?? "",
          });
          setValue("purchase_description", data.purchase_description);
        }
      }
    },
    [setValue],
  );

  // effects
  useEffect(() => {
    loadEditPage();
    return () => {
      itemService.abortGetRequest();
    };
  }, [loadEditPage]);
  useEffect(() => {
    if (editPageItemDetails) {
      setFormData(editPageItemDetails);
    }
  }, [editPageItemDetails, setFormData]);

  const Option = (props: OptionProps<(typeof unitsDropDownOptions)[0]>) => {
    return (
      <components.Option {...props}>
        <div className={"flex items-center justify-between"}>
          <div>{props.children}</div>
          <div>
            <Button
              size={"icon"}
              variant={"ghost"}
              className={"p-1 h-5 w-5"}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log("Edit clicked: ", props.data.unit_id);
              }}
            >
              <Trash className={"w-3 h-3"} />
            </Button>
          </div>
        </div>
      </components.Option>
    );
  };

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
                      <FormLabel htmlFor={"invoice_number"} className={"capitalize"}>
                        Invoice#
                      </FormLabel>
                      <div className="col-span-3 flex-col">
                        <FormControl>
                          <Input
                            id="invoice_number"
                            className="col-span-3"
                            {...register("invoice_number")}
                          />
                        </FormControl>

                      </div>
                    </FormItem>
                  )}
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
