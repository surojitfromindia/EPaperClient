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

type ItemAddPropBasic = {
  contact_type: "customer" | "supplier";
  view_contact_id?: number;
  isModal?: false;
};
type ItemAddConditionalProp = {
  contact_type: "customer" | "supplier";
  view_contact_id?: number;
  isModal?: true;
  closeModal: () => void;
};

type ItemAddProp = ItemAddPropBasic | ItemAddConditionalProp;

export default function ContactAdd(props: ItemAddProp) {
  const { view_contact_id, isModal } = props;

  const { item_id_param } = useParams();
  const editItemId = useMemo(() => {
    if (item_id_param) {
      //try to parse the number, check the return if NaN then return nothing from this memo
      const parseResult = Number.parseInt(item_id_param ?? "");
      if (!Number.isNaN(parseResult)) {
        return parseResult;
      }
    }
    if (view_contact_id) {
      return view_contact_id;
    }
    return null;
  }, [item_id_param, view_contact_id]);
  const isEditMode = useMemo(() => !!editItemId, [editItemId]);
  const submitButtonText = isEditMode ? "update" : "save";
  const pageHeaderText = isEditMode ? "update contact" : "new contact";
  const showCloseButton = !isModal;

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
      label: `${acc.tax_name} [${acc.tax_percentage}%]`,
      value: acc.tax_id,
    }));
  }, [editPageContent.taxes]);
  const handleCloseClick = () => {
    if (props.isModal === true) {
      props.closeModal();
      return;
    }
    navigate("/app/inventory/items");
  };

  const basicSchema = z.object({
    contact_name: z.string().trim().nonempty({ message: "enter item name" }),
    contact_type: z.enum(["customer", "vendor"]),
    company_name: z.string().trim().optional(),
    email: z.string().email().optional(),
    tax: z.object(
      { value: z.number(), label: z.string() },
      {
        invalid_type_error: "select a tax",
        required_error: "select a tax",
      },
    ),
    currency: z.object(
      { value: z.number(), label: z.string() },
      {
        invalid_type_error: "select a currency",
        required_error: "select a currency",
      },
    ),
  });

  const customerSchema = z.object({
    contact_type: z.literal("customer"),
    contact_sub_type: z.enum(["business", "individual"]),
  });
  const vendorSchema = z.object({
    contact_type: z.literal("vendor"),
  });
  const schema = basicSchema.and(
    z.discriminatedUnion("contact_type", [customerSchema, vendorSchema]),
  );

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      contact_sub_type: "business",
    },
  });
  const { register, handleSubmit, watch, control, setValue } = form;

  const handleFormSubmit: SubmitHandler<z.infer<typeof schema>> = async (
    data,
  ) => {
    // let itemFor: ItemFor = "sales";
    // const newItem: ItemCreatePayload = {
    //   name: data.name,
    //   product_type: data.product_type,
    //   unit: data?.unit?.value ?? "",
    //   item_for: itemFor,
    //   tax_id: data.tax.value,
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
    //   await itemService.updateItem({
    //     payload: newItem,
    //     params: {
    //       item_id: editItemId,
    //     },
    //   });
    // } else {
    //   await itemService.addItem({
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
  // const setFormData = useCallback(
  //   (data: typeof editPageItemDetails) => {
  //     // reset the defaults when update
  //     setValue("has_selling_price", false);
  //     setValue("has_purchase_price", false);
  //
  //     if (data) {
  //       setValue("name", data.name!);
  //       setValue("product_type", data.product_type!);
  //       setValue("tax", {
  //         label: `${data.tax_name} [${data.tax_percentage!}%]`,
  //         value: data.tax_id!,
  //       });
  //       setValue("selling_price", data.selling_price!);
  //       setValue("purchase_price", data.purchase_price!);
  //
  //       if (data.unit_id && data.unit) {
  //         setValue("unit", { label: data.unit!, value: data.unit! });
  //       }
  //       if (
  //         data?.item_for === "sales_and_purchase" ||
  //         data?.item_for === "sales"
  //       ) {
  //         setValue("has_selling_price", true);
  //         setValue("sales_account", {
  //           label: data?.sales_account_name ?? "",
  //           value: data.sales_account_id!,
  //           account_name: data?.sales_account_name ?? "",
  //         });
  //         setValue("selling_description", data.selling_description);
  //       }
  //       if (
  //         data?.item_for === "sales_and_purchase" ||
  //         data?.item_for === "purchase"
  //       ) {
  //         setValue("has_purchase_price", true);
  //         setValue("purchase_account", {
  //           label: data?.purchase_account_name ?? "",
  //           value: data.purchase_account_id!,
  //           account_name: data?.purchase_account_name ?? "",
  //         });
  //         setValue("purchase_description", data.purchase_description);
  //       }
  //     }
  //   },
  //   [setValue],
  // );

  // effects
  useEffect(() => {
    loadEditPage();
    return () => {
      itemService.abortGetRequest();
    };
  }, [loadEditPage]);
  // useEffect(() => {
  //   if (editPageItemDetails) {
  //     setFormData(editPageItemDetails);
  //   }
  // }, [editPageItemDetails, setFormData]);

  if (isLoading) {
    return (
      <div className={"relative h-screen w-full"}>
        <LoaderComponent />
      </div>
    );
  }
  return (
    <div className={"flex flex-col h-screen max-h-screen  justify-between"}>
      <div
        className={
          "px-5 pl-3 pr-2 py-3 shadow-md flex justify-between items-center z-10"
        }
      >
        <span className={"text-2xl capitalize"}>{pageHeaderText}</span>
        {showCloseButton && (
          <span>
            <Button variant={"ghost"} onClick={handleCloseClick}>
              <X className={"w-4 h-4"} />
            </Button>
          </span>
        )}
      </div>
      <div className={"flex-grow overflow-y-auto"}>
        <Form {...form}>
          <form>
            <div className={"grid py-4 md:grid-cols-12 grid-cols-6 p-5 my-6"}>
              <div className={"md:grid-cols-4 col-span-7 space-y-2.5"}>
                <FormField
                  control={form.control}
                  name="contact_sub_type"
                  render={({ field }) => (
                    <FormItem className={"grid grid-cols-4 space-y-0"}>
                      <FormLabel>Customer Type</FormLabel>
                      <div className="col-span-3 flex-col">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-row space-x-5"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="business" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Business
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="individual" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Individual
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
                <div>
                  <FormField
                    name={"customer_name"}
                    render={() => (
                      <FormItem className={"grid grid-cols-4 items-center "}>
                        <FormLabel className={"capitalize"}>
                          customer name
                        </FormLabel>
                        <div className="col-span-3 flex flex-row space-x-2">
                          <FormControl>
                            <Input {...register("company_name")} />
                          </FormControl>{" "}
                          <FormControl>
                            <Input {...register("company_name")} />
                          </FormControl>{" "}
                          <FormControl>
                            <Input {...register("company_name")} />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  name={"company_name"}
                  render={() => (
                    <FormItem className={"grid grid-cols-4 items-center "}>
                      <FormLabel
                        htmlFor={"company_name"}
                        className={"capitalize"}
                      >
                        company name
                      </FormLabel>
                      <div className="col-span-2 flex-col">
                        <FormControl>
                          <Input
                            id="company_name"
                            {...register("company_name")}
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  name={"contact_name"}
                  render={() => (
                    <FormItem className={"grid grid-cols-4 items-center "}>
                      <FormLabel
                        htmlFor={"contact_name"}
                        className={"capitalize label-required"}
                      >
                        contact name
                      </FormLabel>
                      <div className="col-span-2 flex-col">
                        <FormControl>
                          <Input
                            id="contact_name"
                            {...register("contact_name")}
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  name={"email"}
                  render={() => (
                    <FormItem className={"grid grid-cols-4 items-center "}>
                      <FormLabel htmlFor={"sku"} className={"capitalize"}>
                        Customer email
                      </FormLabel>
                      <div className="col-span-2 flex-col">
                        <FormControl>
                          <Input
                            id="sku"
                            {...register("email")}
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  name={"comtact"}
                  render={() => (
                    <FormItem className={"grid grid-cols-4 items-center "}>
                      <FormLabel htmlFor={"sku"} className={"capitalize"}>
                        Customer phone
                      </FormLabel>
                      <div className="col-span-2 flex flex-row space-x-2">
                        <FormControl>
                          <Input
                            id="sku"
                            {...register("email")}
                          />
                        </FormControl>
                        <FormControl>
                          <Input
                            id="sku"
                            {...register("email")}
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div
              className={
                "grid grid-cols-1 md:grid-cols-5 p-5 bg-gray-50 space-y-6 bg-opacity-60 md:space-y-0   md:space-x-10"
              }
            ></div>
            <div className={"h-32"}></div>
          </form>
        </Form>
      </div>
      <div
        className={
          "fixed bottom-0 bg-background w-full py-2 px-5 flex space-x-2 border-t-1 "
        }
      >
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
