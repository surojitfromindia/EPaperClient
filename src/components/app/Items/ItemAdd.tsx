import { Button } from "@/components/ui/button.tsx";
import { Trash, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
    ItemCreatePayload,
    ItemEditPageContent, ItemFor,
} from "@/API/Resources/v1/Item/Item.Service.ts";
import LoaderComponent from "@/components/app/common/LoaderComponent.tsx";
import ReactSelect, { components, OptionProps } from "react-select";
import {
  reactSelectComponentOverride,
  reactSelectStyle,
} from "@/util/style/reactSelectStyle.ts";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { useAppSelector } from "@/redux/hooks.ts";
import { Textarea } from "@/components/ui/textarea.tsx";
import { formatOptionLabelOfAccounts } from "@/util/FormatAccountsLabel.tsx";
import RNumberFormat from "@/components/ui/RNumberFormat.tsx";
import {toast} from "@/components/ui/use-toast.ts";

const itemService = new ItemService();

export default function ItemAdd() {
    useAppSelector(
        (appState) => appState.organization.currency_code,
    );

    const navigate = useNavigate();
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
      .getItemEditPage()
      .then((data) => {
        setEditPageContent(data!);
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  }, []);

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
      label: `${acc.name} [${acc.rate_formatted}%]`,
      value: acc.tax_id,
    }));
  }, [editPageContent.taxes]);
  const handleCloseClick = () => {
    navigate("/app/inventory/items");
  };
  // effects
  useEffect(() => {
    loadEditPage();

    return () => {
      itemService.abortGetRequest();
    };
  }, [loadEditPage]);

  const basicSchema = z
    .object({
      name: z.string().trim().nonempty({message:"enter item name"}),
      product_type: z.enum(["goods", "service"]),
      unit: z.object({ value: z.string().nonempty(), label: z.string() },{
          invalid_type_error:"select or type a unit",
          required_error:"select or type a unit"
      }),
      sku: z.string().trim().optional(),
      has_selling_price: z.boolean().optional(),
      has_purchase_price: z.boolean().optional(),
      tax: z.object({ value: z.number(), label: z.string() },{
          invalid_type_error:"select a tax",
          required_error:"select a tax"
      }),
    })
    .refine((data) => data.has_purchase_price || data.has_selling_price, {
      message: "good",
      path: ["has_selling_price"],
    });
  const hasSellingInformationSchema = z.object({
    has_selling_price: z.literal(true),
    selling_price: z.number({required_error:"enter selling price"}),
    sales_account: z.object({ value: z.number(), label: z.string() },{
        invalid_type_error:"select an account",
        required_error:"select an account"
    }),
    selling_description: z.string().optional(),
  });
  const hasNoSellingInformationSchema = z.object({
    has_selling_price: z.literal(false),
  });
  const hasPurchaseInformation = z.object({
    has_purchase_price: z.literal(true),
    purchase_price: z.number({required_error:"enter purchase price"}),
    purchase_account: z.object({ value: z.number(), label: z.string() },{
        invalid_type_error:"select an account",
        required_error:"select an account"
    }),
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
      has_selling_price: true,
      has_purchase_price: true,
      product_type: "goods",
    },
  });
  const {
    formState: { errors },
    register,
    handleSubmit,
      watch,
    control,
  } = form;
  const has_selling_price = watch('has_selling_price');
  const has_purchase_price = watch('has_purchase_price');

  const handleFormSubmit: SubmitHandler<z.infer<typeof schema>> = async (
    data,
  ) => {
      let itemFor:ItemFor = "sales";
      const newItem :ItemCreatePayload= {
          name: data.name,
          product_type:data.product_type,
          unit:data?.unit?.value,
          item_for:itemFor,
          tax_id: data.tax.value,
      }
      if(data.has_selling_price){
          itemFor ="sales"
          newItem.selling_price = data.selling_price;
          newItem.selling_description = data.selling_description;
          newItem.sales_account_id = data.sales_account.value;
      }
      if(data.has_purchase_price){
          itemFor ="purchase"
          newItem.purchase_price = data.purchase_price
          newItem.purchase_description = data.purchase_description
          newItem.purchase_account_id = data.purchase_account.value
      }
      if(data.has_selling_price && data.has_purchase_price){
          itemFor ="sales_and_purchase"
      }
      newItem.item_for = itemFor;

      await  itemService.addItem({
          payload: newItem
      })

      toast({
          title: "Success",
          description: "Item is created successfully",
      });
      navigate("/app/inventory/items")

  };
  console.log("errors", errors);

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
    return <LoaderComponent />;
  }
  return (
    <div className={"flex flex-col h-screen max-h-screen  justify-between"}>
      <div
        className={"px-5 py-3 shadow-md flex justify-between items-center z-10"}
      >
        <span className={"text-2xl"}>New Item</span>
        <span>
          <Button variant={"ghost"} onClick={handleCloseClick}>
            <X className={"w-4 h-4"} />
          </Button>
        </span>
      </div>
      <div className={"flex-grow overflow-y-auto"}>
        <Form {...form}>
          <form>
            <div className={"grid py-4 md:grid-cols-12 grid-cols-6 p-5 my-6"}>
              <div className={"md:grid-cols-4 col-span-5 space-y-2.5"}>
                <FormField
                  control={form.control}
                  name="product_type"
                  render={({ field }) => (
                    <FormItem className={"grid grid-cols-4 space-y-0"}>
                      <FormLabel>Type</FormLabel>
                      <div className="col-span-3 flex-col">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-row space-x-5"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="goods" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Goods
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="service" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Service
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <span className={"h-4 block"}>
                          <FormMessage />
                        </span>{" "}
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  name={"name"}
                  render={() => (
                    <FormItem className={"grid grid-cols-4 items-center "}>
                      <FormLabel
                        htmlFor={"name"}
                        className={"capitalize label-required"}
                      >
                        Name
                      </FormLabel>
                      <div className="col-span-3 flex-col">
                        <FormControl>
                          <Input id="name" {...register("name")} />
                        </FormControl>
                        <span className={"h-4 block"}>
                          <FormMessage />
                        </span>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  name={"sku"}
                  render={() => (
                    <FormItem className={"grid grid-cols-4 items-center "}>
                      <FormLabel htmlFor={"sku"} className={"capitalize"}>
                        SKU
                      </FormLabel>
                      <div className="col-span-3 flex-col">
                        <FormControl>
                          <Input
                            id="sku"
                            className="col-span-3"
                            {...register("sku")}
                          />
                        </FormControl>
                        <span className={"h-4 block"}>
                          <FormMessage />
                        </span>{" "}
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  name={"unit"}
                  render={({ field }) => (
                    <FormItem className={"grid grid-cols-4 items-center "}>
                      <FormLabel htmlFor={"unit"} className=" capitalize">
                        unit
                      </FormLabel>
                      <div className="col-span-3 flex-col">
                        <FormControl>
                          <ReactSelect
                            className={"col-span-3"}
                            options={unitsDropDownOptions}
                            {...field}
                            inputId={"unit"}
                            classNames={reactSelectStyle}
                            components={{
                              ...reactSelectComponentOverride,
                              Option,
                            }}
                          />
                        </FormControl>
                        <span className={"h-4 block"}>
                          <FormMessage />
                        </span>{" "}
                      </div>
                    </FormItem>
                  )}
                  control={control}
                />
              </div>
            </div>
            <div className={"grid grid-cols-6 md:grid-cols-12 p-5 bg-gray-50 bg-opacity-60 space-x-10"}>
              {/*sales information*/}
              <div className={"col-span-5"}>
                <div>
                  <FormField
                    render={({ field }) => (
                      <FormItem
                        className={"flex flex-row items-start space-y-0"}
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="has_selling_price"
                            name={"has_selling_price"}
                            className={"inline-flex mt-1.5 mr-2"}
                          />
                        </FormControl>
                        <div className="">
                          <FormLabel
                            htmlFor={"has_selling_price"}
                            className={"text-xl capitalize"}
                          >
                            sales information
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                    name={"has_selling_price"}
                    control={control}
                  />
                </div>
                <div className={"flex flex-col space-y-2 mt-5"}>
                  <FormField
                    name={"selling_price"}
                    render={({ field }) => (
                      <FormItem className={"grid grid-cols-4 items-center "}>
                        <FormLabel
                          htmlFor={"selling_price"}
                          className={"capitalize label-required"}
                        >
                          selling price
                        </FormLabel>
                        <div className="col-span-3 flex-col">
                          <FormControl>
                            <div className={"relative col-span-3"}>
                              <RNumberFormat
                                id="selling_price"
                                onValueChange={({ floatValue }) => {
                                  field.onChange(floatValue);
                                }}
                                customInput={Input}
                                getInputRef={field.ref}
                                disabled={!has_selling_price}
                              />
                            </div>
                          </FormControl>
                          <span className={"h-4 block"}>
                            <FormMessage />
                          </span>{" "}
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField

                    name={"sales_account"}
                    render={({ field }) => (
                      <FormItem className={"grid grid-cols-4 items-center "}>
                        <FormLabel
                          htmlFor={"selling_account"}
                          className=" capitalize"
                        >
                          Account
                        </FormLabel>
                        <div className="col-span-3 flex-col">
                          <FormControl>
                            <ReactSelect
                              className={"col-span-3"}
                              options={incomeAccountsDropDown}
                              {...field}
                              inputId={"selling_account"}
                              classNames={reactSelectStyle}
                              components={{
                                ...reactSelectComponentOverride,
                              }}
                              formatOptionLabel={formatOptionLabelOfAccounts}
                              isDisabled={!has_selling_price}
                            />
                          </FormControl>
                          <span className={"h-4 block"}>
                            <FormMessage />
                          </span>{" "}
                        </div>
                      </FormItem>
                    )}
                    control={control}
                  />
                  <FormField
                    render={() => (
                      <FormItem className={"grid grid-cols-4 items-baseline "}>
                        <FormLabel
                          htmlFor={"selling_description"}
                          className={"capitalize"}
                        >
                          description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            id="selling_description"
                            placeholder={"Description"}
                            className="col-span-3"
                            {...register("selling_description")}
                            disabled={!has_selling_price}

                          />
                        </FormControl>
                        <span className={"h-4 block"}>
                          <FormMessage />
                        </span>
                      </FormItem>
                    )}
                    name={"selling_description"}
                  />
                  <FormField
                    name={"tax"}
                    render={({ field }) => (
                      <FormItem className={"grid grid-cols-4 items-center "}>
                        <FormLabel htmlFor={"tax"} className=" capitalize">
                          tax rate
                        </FormLabel>
                        <div className="col-span-3 flex-col">
                          <FormControl>
                            <ReactSelect
                              className={"col-span-3"}
                              options={taxesDropDown}
                              {...field}
                              inputId={"tax"}
                              classNames={reactSelectStyle}
                              components={{
                                ...reactSelectComponentOverride,
                              }}
                              isClearable={true}
                            />
                          </FormControl>
                          <span className={"h-4 block"}>
                            <FormMessage />
                          </span>{" "}
                        </div>
                      </FormItem>
                    )}
                    control={control}
                  />
                </div>
              </div>
              {/*purchase information*/}
              <div className={"col-span-5"}>
                <div>
                  <FormField
                    render={({ field }) => (
                      <FormItem
                        className={"flex flex-row items-start space-y-0"}
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="has_purchase_price"
                            name={"has_purchase_price"}
                            className={"inline-flex mt-1.5 mr-2"}
                          />
                        </FormControl>
                        <div className="">
                          <FormLabel
                            htmlFor={"has_purchase_price"}
                            className={"text-xl capitalize"}
                          >
                            purchase information
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                    name={"has_purchase_price"}
                    control={control}
                  />
                </div>
                <div className={"flex flex-col space-y-2 mt-5"}>
                  <FormField
                    name={"purchase_price"}
                    render={({ field }) => (
                      <FormItem className={"grid grid-cols-4 items-center "}>
                        <FormLabel
                          htmlFor={"purchase_price"}
                          className={"capitalize label-required"}
                        >
                          cost price
                        </FormLabel>
                        <div className="col-span-3 flex-col">
                          <FormControl>
                            <RNumberFormat
                              id="purchase_price"
                              onValueChange={({ floatValue }) => {
                                field.onChange(floatValue);
                              }}
                              getInputRef={field.ref}
                              customInput={Input}
                              disabled={!has_purchase_price}

                            />
                          </FormControl>
                          <span className={"h-4 block"}>
                            <FormMessage />
                          </span>{" "}
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    name={"purchase_account"}
                    render={({ field }) => (
                      <FormItem className={"grid grid-cols-4 items-center "}>
                        <FormLabel
                          htmlFor={"purchase_account"}
                          className=" capitalize"
                        >
                          Account
                        </FormLabel>
                        <div className="col-span-3 flex-col">
                          <FormControl>
                            <ReactSelect
                              className={"col-span-3"}
                              options={purchaseAccountsDropDown}
                              {...field}
                              inputId={"purchase_account"}
                              classNames={reactSelectStyle}
                              components={{
                                ...reactSelectComponentOverride,
                              }}
                              formatOptionLabel={formatOptionLabelOfAccounts}
                              isDisabled={!has_purchase_price}
                            />
                          </FormControl>
                          <span className={"h-4 block"}>
                            <FormMessage />
                          </span>{" "}
                        </div>
                      </FormItem>
                    )}
                    control={control}
                  />
                  <FormField
                    render={() => (
                      <FormItem className={"grid grid-cols-4 items-baseline "}>
                        <FormLabel
                          htmlFor={"purchase_description"}
                          className={"capitalize"}
                        >
                          description
                        </FormLabel>
                        <div className="col-span-3 flex-col">
                          <FormControl>
                            <Textarea
                              id="purchase_description"
                              placeholder={"Description"}
                              className="col-span-3"
                              {...register("purchase_description")}
                                disabled={!has_purchase_price}
                            />
                          </FormControl>
                          <span className={"h-4 block"}>
                            <FormMessage />
                          </span>{" "}
                        </div>
                      </FormItem>
                    )}
                    name={"purchase_description"}
                  />
                </div>
              </div>
            </div>
            <div className={"h-32"}></div>
          </form>
        </Form>
      </div>
      <div className={"h-16 mb-12 py-2 px-5 flex space-x-2 bg-accent "}>
        <Button onClick={handleSubmit(handleFormSubmit)}>Save</Button>
        <Button variant={"outline"}>Cancel</Button>
      </div>
    </div>
  );
}
