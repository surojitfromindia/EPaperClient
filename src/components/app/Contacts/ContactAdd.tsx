import { Button } from "@/components/ui/button.tsx";
import { PlusCircle, X, XCircle } from "lucide-react";
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
import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
import LoaderComponent from "@/components/app/common/LoaderComponent.tsx";
import ReactSelect from "react-select";
import {
  reactSelectComponentOverride,
  reactSelectStyle,
} from "@/util/style/reactSelectStyle.ts";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import AutoComplete from "@/components/app/common/AutoCompleteInputable.tsx";
import { ContactService } from "@/API/Resources/v1/Contact/Contact.Service.ts";
import { ContactEditPageContent } from "@/API/Resources/v1/Contact/ContactEditPage.Payload";
import { Contact, ContactType } from "@/API/Resources/v1/Contact/Contact";
import { SALUTATION } from "@/constants/Contact.Constants.ts";

import {
  CurrencyRSelectOption,
  makeCurrencyRSelectOptions,
  makeTaxRSelectOptions,
  mapPaymentTermToRSelect, PaymentTermRSelectOption, TaxRSelectOption,
} from "@/components/app/common/reactSelectOptionCompositions.ts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { ValidityUtil } from "@/util/ValidityUtil.ts";
import { ContactPerson } from "@/API/Resources/v1/ContactPerson/ContactPerson";
import { ContactPersonCreatePayload } from "@/API/Resources/v1/ContactPerson/ContactPersonCreate.Payload";
import { FormValidationErrorAlert } from "@/components/app/common/FormValidationErrorAlert.tsx";
import { ReactHookFormUtil } from "@/util/reactHookFormUtil.ts";
import { ContactCreatePayload } from "@/API/Resources/v1/Contact/ContactCreate.Payload";
import { toast } from "@/components/ui/use-toast.ts";

const contactService = new ContactService();

//-------------------types-------------------
type ContactAddPropBasic = {
  contact_type: "customer" | "vendor";
  view_contact_id?: number;
  isModal?: false;
};
type ContactAddConditionalProp = {
  contact_type: "customer" | "vendor";
  view_contact_id?: number;
  isModal?: true;
  closeModal: () => void;
};
type ContactAddProp = ContactAddPropBasic | ContactAddConditionalProp;

//-------------------validation schema-------------------
const contactPersonSchema = z.object({
  salutation: z.string().trim().optional(),
  first_name: z.string().trim().optional(),
  last_name: z.string().trim().optional(),
  email: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  mobile: z.string().trim().optional(),
});
const basicSchema = z.object({
  contact_name: z
    .string({
      invalid_type_error: "enter contact name",
      required_error: "enter contact name",
    })
    .trim()
    .nonempty({ message: "enter contact name" }),
  contact_type: z.enum(["customer", "vendor"]),
  company_name: z.string().trim().optional(),
  currency: z.object(
    { value: z.number(), label: z.string() },
    {
      invalid_type_error: "select a currency",
      required_error: "select a currency",
    },
  ),
  payment_term: z
    .object(
      { value: z.number(), label: z.string() },
      {
        invalid_type_error: "select a payment term",
        required_error: "select a payment term",
      },
    )
    .optional(),
  tax: z
    .object(
      { value: z.number(), label: z.string() },
      {
        invalid_type_error: "select a tax",
        required_error: "select a tax",
      },
    )
    .optional(),
  remarks: z.string().trim().optional(),

  // treat these as first contact person
  salutation: contactPersonSchema.shape.salutation,
  first_name: contactPersonSchema.shape.first_name,
  last_name: contactPersonSchema.shape.last_name,
  email: contactPersonSchema.shape.email,
  phone: contactPersonSchema.shape.phone,
  mobile: contactPersonSchema.shape.mobile,
  contact_persons: z.array(contactPersonSchema).optional(),
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

export default function ContactAdd(props: ContactAddProp) {
  const contact_type = props.contact_type;
  const redirect_sub_part =
    contact_type === "customer" ? "customers" : "vendors";

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
  const [editPageContactDetails, setEditPageContactDetails] =
    useState<Contact>();
  const [editPageContent, setEditPageContent] =
    useState<ContactEditPageContent>({
      taxes: [],
      payment_terms: [],
      currencies: [],
    });
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("other_details" as string);

  const [errorMessagesForBanner, setErrorMessagesForBanner] = useState<
    string[]
  >([]);

  const loadEditPage = useCallback(() => {
    contactService
      .getContactEditPage({
        contact_id: editItemId,
      })
      .then((data) => {
        setEditPageContent(data!);
        setEditPageContactDetails(data?.contact);
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  }, [editItemId]);

  const taxesDropDown = useMemo(() => {
    return editPageContent.taxes.map(makeTaxRSelectOptions);
  }, [editPageContent.taxes]);
  const paymentTermsDropDown = useMemo(() => {
    return editPageContent.payment_terms.map(mapPaymentTermToRSelect);
  }, [editPageContent.payment_terms]);
  const currenciesDropDown = useMemo(() => {
    return editPageContent.currencies.map(makeCurrencyRSelectOptions);
  }, [editPageContent.currencies]);

  const handleCloseClick = () => {
    if (props.isModal === true) {
      props.closeModal();
      return;
    }
    navigate(`/app/${redirect_sub_part}`);
  };

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      contact_type: contact_type,
      contact_sub_type: contact_type === "customer" ? "business" : null,
      contact_persons: [],
    },
  });
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const first_name = watch("first_name");
  const last_name = watch("last_name");
  const salutation = watch("salutation");

  const handleFormSubmit: SubmitHandler<z.infer<typeof schema>> = async (
    data,
  ) => {
    const contactType: ContactType = contact_type;
    const newContactBasic: ContactCreatePayload = {
      contact_type: contactType,
      contact_name: data.contact_name,
      company_name: data.company_name,
      currency_id: data.currency.value,
      remarks: data.remarks,
      contact_persons: data.contact_persons,
      payment_term_id: data.payment_term?.value,
      tax_id: data.tax?.value,
      contact_sub_type: null,
    };
    if (
      data.contact_type === "customer" &&
      newContactBasic.contact_type === "customer"
    ) {
      newContactBasic.contact_sub_type = data.contact_sub_type;
    }

    if (isEditMode) {
      return;
    } else {
      await contactService.addContact({
        payload: newContactBasic,
      });
    }

    // show a success message
    const toastMessage = isEditMode
      ? "Contact is updated successfully"
      : "Contact is created successfully";
    toast({
      title: "Success",
      description: toastMessage,
    });
    navigate(`/app/${redirect_sub_part}`);
  };
  // const setFormData = useCallback(
  //   (data: typeof editPageContactDetails) => {
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

  const onTabChange = (value: string) => {
    setCurrentTab(value);
  };
  const handleContactPersonsUpdate = (
    contactPersons: (ContactPerson | ContactPersonCreatePayload)[],
  ) => {
    setValue("contact_persons", contactPersons);
  };

  // effects
  useEffect(() => {
    loadEditPage();
    return () => {
      contactService.abortGetRequest();
    };
  }, [loadEditPage]);

  // useEffect(() => {
  //   if (editPageContactDetails) {
  //     setFormData(editPageContactDetails);
  //   }
  // }, [editPageContactDetails, setFormData]);

  // update the error message banner
  useEffect(() => {
    if (errors) {
      setErrorMessagesForBanner(
        ReactHookFormUtil.deepFlatReactHookFormErrorOnlyMessage(errors),
      );
    }
  }, [errors]);

  const generateContactNameSuggestions = useMemo(() => {
    // using given "first_name" and "last_name" generate a list of suggestions
    // we combine them is various ways
    // 1. first name + last name
    // 2. first name + last name + salutation
    // 3. salutation + first name + last name
    // 4. first_name, last name
    // 5. salutation, first name
    // 6. salutation, last name
    const firstName = first_name;
    const lastName = last_name;
    const suggestions = [];
    if (
      ValidityUtil.isNotEmpty(firstName) &&
      ValidityUtil.isNotEmpty(lastName)
    ) {
      suggestions.push(`${firstName} ${lastName}`);
    }
    if (
      ValidityUtil.isNotEmpty(firstName) &&
      ValidityUtil.isNotEmpty(lastName) &&
      ValidityUtil.isNotEmpty(salutation)
    ) {
      suggestions.push(`${firstName} ${lastName} ${salutation}`);
    }

    if (
      ValidityUtil.isNotEmpty(firstName) &&
      ValidityUtil.isNotEmpty(lastName) &&
      ValidityUtil.isNotEmpty(salutation)
    ) {
      suggestions.push(`${salutation} ${firstName} ${lastName}`);
    }
    if (
      ValidityUtil.isNotEmpty(firstName) &&
      ValidityUtil.isNotEmpty(lastName)
    ) {
      suggestions.push(`${firstName}, ${lastName}`);
    }
    if (
      ValidityUtil.isNotEmpty(firstName) &&
      ValidityUtil.isNotEmpty(salutation)
    ) {
      suggestions.push(`${salutation} ${firstName}`);
    }
    if (
      ValidityUtil.isNotEmpty(lastName) &&
      ValidityUtil.isNotEmpty(salutation)
    ) {
      suggestions.push(`${salutation} ${lastName}`);
    }

    return suggestions.map((suggestion) => ({
      label: suggestion,
      value: suggestion,
    }));
  }, [first_name, last_name, salutation]);

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

      <div className={"flex-grow overflow-y-auto mb-12 mt-5"}>
        <div className={"px-5"}>
          <FormValidationErrorAlert messages={errorMessagesForBanner} />
        </div>
        <Form {...form}>
          <form>
            <div className={"grid py-4 md:grid-cols-12 grid-cols-6 p-5 my-6"}>
              <div
                className={
                  "md:grid-cols-4 col-span-8 space-y-2.5 max-w-[1000px]"
                }
              >
                <FormField
                  control={form.control}
                  name="contact_sub_type"
                  render={({ field }) => (
                    <FormItem className={"grid grid-cols-4 space-y-0"}>
                      <FormLabel htmlFor={"contact_sub_type_business"}>
                        Customer Type
                      </FormLabel>
                      <FormControl className="col-span-3 flex-col">
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-row space-x-5"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                id={"contact_sub_type_business"}
                                value="business"
                              />
                            </FormControl>
                            <FormLabel
                              className="font-normal"
                              htmlFor={"contact_sub_type_business"}
                            >
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
                    </FormItem>
                  )}
                />
                <div>
                  <FormField
                    name={"salutation"}
                    render={({ field }) => (
                      <FormItem className={"grid grid-cols-4 items-center "}>
                        <FormLabel
                          className={"capitalize"}
                          htmlFor={"first_name"}
                        >
                          customer name
                        </FormLabel>
                        <div className="col-span-3 flex">
                          <AutoComplete
                            options={SALUTATION}
                            emptyMessage={""}
                            placeholder={"Salutation"}
                            textInputClassNames={"w-[120px]"}
                            onValueChange={(option) => {
                              field.onChange(option.value);
                            }}
                            value={field.value}
                          />
                          <FormControl>
                            <Input
                              autoComplete={"off"}
                              id={"first_name"}
                              className={"mx-2"}
                              {...register("first_name")}
                              placeholder={"First name"}
                            />
                          </FormControl>{" "}
                          <FormControl>
                            <Input
                              autoComplete={"off"}
                              id={"last_name"}
                              {...register("last_name")}
                              placeholder={"Last name"}
                            />
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
                            placeholder={"Company name"}
                            autoComplete={"off"}
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
                  render={({ field }) => (
                    <FormItem className={"grid grid-cols-4 items-center "}>
                      <FormLabel
                        htmlFor={"contact_name"}
                        className={"capitalize label-required"}
                      >
                        contact name
                      </FormLabel>
                      <div className="col-span-2 flex-col">
                        <FormControl>
                          <AutoComplete
                            options={generateContactNameSuggestions}
                            emptyMessage={"No suggestions"}
                            placeholder={"Contact name"}
                            onValueChange={(option) => {
                              field.onChange(option.value);
                            }}
                            value={field.value}
                            inputId={"contact_name"}
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
                      <FormLabel htmlFor={"email"} className={"capitalize"}>
                        Customer email
                      </FormLabel>
                      <div className="col-span-2 flex-col">
                        <FormControl>
                          <Input
                            placeholder={"Email"}
                            autoComplete={"off"}
                            id="email"
                            {...register("email")}
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />

                <FormItem className={"grid grid-cols-4 items-center "}>
                  <FormLabel htmlFor={"phone"} className={"capitalize"}>
                    Customer phone
                  </FormLabel>
                  <div className="col-span-2 flex flex-row space-x-2">
                    <FormControl>
                      <Input
                        autoComplete={"off"}
                        id={"phone"}
                        {...register("phone")}
                        placeholder={"Work phone"}
                      />
                    </FormControl>
                    <FormControl>
                      <Input
                        autoComplete={"off"}
                        {...register("mobile")}
                        placeholder={"Mobile"}
                      />
                    </FormControl>
                  </div>
                </FormItem>
              </div>
            </div>
            <Tabs
              defaultValue={"other_details"}
              className="mt-3 flex-1 flex-grow"
              onValueChange={onTabChange}
            >
              <div className={"w-full ml-4  bg-background"}>
                <TabsList className={"space-x-4"}>
                  <TabsTrigger value="other_details" className={"capitalize"}>
                    Other Details
                  </TabsTrigger>
                  <TabsTrigger value="contact_persons" className={"capitalize"}>
                    Contact Persons
                  </TabsTrigger>
                  <TabsTrigger value="remarks" className={"capitalize"}>
                    Remarks
                  </TabsTrigger>
                </TabsList>
              </div>
            </Tabs>
            <div className={"w-full  mt-5  bg-background"}>
              <div
                className={`px-5  ${
                  currentTab === "other_details" ? "block" : "hidden"
                }`}
              >
                <ContactCurrencyAndOtherDetails
                  taxesDropDown={taxesDropDown}
                  paymentTermsDropDown={paymentTermsDropDown}
                  currenciesDropDown={currenciesDropDown}
                />
              </div>{" "}
              <div
                className={`px-5  ${
                  currentTab === "contact_persons" ? "block" : "hidden"
                }`}
              >
                <ContactPersonsList
                  contactDetails={editPageContactDetails}
                  onContactPersonUpdate={handleContactPersonsUpdate}
                />
              </div>
              <div
                className={`px-5  ${
                  currentTab === "remarks" ? "block" : "hidden"
                }`}
              >
                <FormItem className={"flex flex-col mt-5 max-w-[600px]"}>
                  <FormLabel htmlFor={"remarks"} className={"capitalize"}>
                    Remarks
                    <span className={"text-muted-foreground mx-2"}>
                      (For internal use only)
                    </span>
                  </FormLabel>
                  <div className="">
                    <FormControl>
                      <Textarea id="remarks" {...register("remarks")} />
                    </FormControl>
                  </div>
                </FormItem>
              </div>
            </div>
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

const ContactCurrencyAndOtherDetails = ({
  taxesDropDown,
  paymentTermsDropDown,
  currenciesDropDown,
}:{
    taxesDropDown: TaxRSelectOption[];
    paymentTermsDropDown: PaymentTermRSelectOption[];
    currenciesDropDown: CurrencyRSelectOption[];
}) => {
  return (
    <div className={""}>
      <div className={"grid md:grid-cols-12 grid-cols-6 "}>
        <div className={"md:grid-cols-4 col-span-7 space-y-2.5 max-w-[900px]"}>
          <FormField
            name={"currency"}
            render={({ field }) => (
              <FormItem className={"grid grid-cols-4 items-center "}>
                <FormLabel
                  htmlFor={"currency"}
                  className={"capitalize label-required"}
                >
                  Currency
                </FormLabel>
                <div className="col-span-2 flex-col">
                  <FormControl>
                    <ReactSelect
                      {...field}
                      inputId={"currency"}
                      classNames={reactSelectStyle}
                      components={reactSelectComponentOverride}
                      options={currenciesDropDown}
                      placeholder={"Select currency"}
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />

          <FormField
            name={"tax"}
            render={({ field }) => (
              <FormItem className={"grid grid-cols-4 items-center "}>
                <FormLabel htmlFor={"tax"} className={"capitalize"}>
                  Tax Rate
                </FormLabel>
                <div className="col-span-2 flex-col">
                  <FormControl>
                    <ReactSelect
                      {...field}
                      isClearable={true}
                      placeholder={"Select tax"}
                      options={taxesDropDown}
                      inputId={"tax"}
                      classNames={reactSelectStyle}
                      components={{
                        ...reactSelectComponentOverride,
                      }}
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />

          <FormField
            name={"payment_term"}
            render={({ field }) => (
              <FormItem className={"grid grid-cols-4 items-center "}>
                <FormLabel htmlFor={"payment_term"} className={"capitalize "}>
                  Payment Terms
                </FormLabel>
                <div className="col-span-2 flex-col">
                  <FormControl>
                    <ReactSelect
                      {...field}
                      inputId={"payment_term"}
                      classNames={reactSelectStyle}
                      components={reactSelectComponentOverride}
                      options={paymentTermsDropDown}
                      placeholder={"Select payment terms"}
                      isClearable={true}
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};

type ContactPersonListProps = {
  contactDetails?: Contact;
  onContactPersonUpdate: (
    contact_persons: (ContactPerson | ContactPersonCreatePayload)[],
  ) => void;
};

const ContactPersonsList = ({
  contactDetails,
  onContactPersonUpdate,
}: ContactPersonListProps) => {
  const BLANK_CONTACT_PERSON: ContactPersonCreatePayload = {
    salutation: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    mobile: "",
  };
  const [contactPersons, setContactPersons] = useState<
    (ContactPerson | ContactPersonCreatePayload)[]
  >([BLANK_CONTACT_PERSON]);

  useEffect(() => {
    if (ValidityUtil.isNotEmpty(contactDetails?.contact_persons)) {
      setContactPersons(contactDetails.contact_persons);
    }
  }, [contactDetails]);

  const handleAddNewContactPerson = () => {
    setContactPersons((prev) => [...prev, BLANK_CONTACT_PERSON]);
  };

  const handleRemoveContactPerson = (index: number) => {
    if (contactPersons.length === 1) return;
    setContactPersons((prev) => {
      const newContactPersons = [...prev];
      newContactPersons.splice(index, 1);
      onContactPersonUpdate(newContactPersons);
      return newContactPersons;
    });
  };

  type InputControlFieldName =
    | "salutation"
    | "first_name"
    | "last_name"
    | "email"
    | "phone"
    | "mobile";
  const handleFieldChange = (
    index: number,
    field: InputControlFieldName,
    value: string,
  ) => {
    setContactPersons((prev) => {
      const newContactPersons = [...prev];
      const modifiedContactPerson = newContactPersons[index];
      switch (field) {
        case "salutation":
          modifiedContactPerson.salutation = value;
          break;
        case "first_name":
          modifiedContactPerson.first_name = value;
          break;
        case "last_name":
          modifiedContactPerson.last_name = value;
          break;
        case "email":
          modifiedContactPerson.email = value;
          break;
        case "phone":
          modifiedContactPerson.phone = value;
          break;
        case "mobile":
          modifiedContactPerson.mobile = value;
          break;
      }

      onContactPersonUpdate(newContactPersons);
      return newContactPersons;
    });
  };

  return (
    <div>
      <Table
        className={
          "divide-y  divide-gray-200 border-y border-gray-300 max-w-[900px] "
        }
      >
        <TableHeader>
          <TableRow>
            <TableHead className={"text_thead w-[40px]"}>salutation</TableHead>
            <TableHead className={"text_thead"}>first name</TableHead>
            <TableHead className={"text_thead"}>last name</TableHead>
            <TableHead className={"text_thead"}>email</TableHead>
            <TableHead className={"text_thead"}>work phone</TableHead>
            <TableHead className={"text_thead"}>mobile phone</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contactPersons.map((contactPerson, index) => {
            return (
              <TableRow
                key={index}
                className="divide-x divide-gray-200 hover:bg-none!impotant"
              >
                <TableCell className="py-1 px-1">
                  <AutoComplete
                    options={SALUTATION}
                    emptyMessage={""}
                    placeholder={"Salutation"}
                    textInputClassNames={"w-full"}
                    onValueChange={(value) =>
                      handleFieldChange(index, "salutation", value.value)
                    }
                    value={{
                      label: contactPerson.salutation,
                      value: contactPerson.salutation,
                    }}
                  />
                </TableCell>
                <TableCell className="py-1 px-1">
                  <Input
                    id={`first_name_${index}`}
                    onBlur={(e) =>
                      handleFieldChange(index, "first_name", e.target.value)
                    }
                    defaultValue={contactPerson.first_name}
                  />
                </TableCell>
                <TableCell className="py-1 px-1">
                  <Input
                    id={`last_name_${index}`}
                    onBlur={(e) =>
                      handleFieldChange(index, "last_name", e.target.value)
                    }
                    defaultValue={contactPerson.last_name}
                  />
                </TableCell>
                <TableCell className="py-1 px-1">
                  <Input
                    id={`email_${index}`}
                    onBlur={(e) =>
                      handleFieldChange(index, "email", e.target.value)
                    }
                    defaultValue={contactPerson.email}
                  />
                </TableCell>
                <TableCell className="py-1 px-1">
                  <Input
                    id={`phone_${index}`}
                    onBlur={(e) =>
                      handleFieldChange(index, "phone", e.target.value)
                    }
                    defaultValue={contactPerson.phone}
                  />
                </TableCell>

                <TableCell className="text-right px-1 py-1">
                  <Input
                    id={`mobile_${index}`}
                    onBlur={(e) =>
                      handleFieldChange(index, "mobile", e.target.value)
                    }
                    defaultValue={contactPerson.mobile}
                  />

                  <div className={"relative break-words"}>
                    {
                      <div className={"absolute -top-[26px]  -right-[32px] "}>
                        <XCircle
                          type={"button"}
                          className={"w-4 h-4 text-destructive cursor-pointer"}
                          onClick={() => handleRemoveContactPerson(index)}
                        />
                      </div>
                    }
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Button
        variant="secondary"
        className={"border-r-0 rounded-r-none h-8 pl-2 mt-2.5"}
        type={"button"}
        aria-description={"Add new row at the end"}
        onClick={handleAddNewContactPerson}
      >
        <PlusCircle className={"h-4 w-4 text-primary mr-1"} />
        New Contact Person
      </Button>
    </div>
  );
};
