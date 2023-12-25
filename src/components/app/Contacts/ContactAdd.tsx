import { Button } from "@/components/ui/button.tsx";
import { Loader2, X } from "lucide-react";
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
  mapPaymentTermToRSelect,
  PaymentTermRSelectOption,
  TaxRSelectOption,
} from "@/components/app/common/reactSelectOptionCompositions.ts";
import { ValidityUtil } from "@/util/ValidityUtil.ts";
import { ContactPerson } from "@/API/Resources/v1/ContactPerson/ContactPerson";
import { ContactPersonCreatePayload } from "@/API/Resources/v1/ContactPerson/ContactPersonCreate.Payload";
import { FormValidationErrorAlert } from "@/components/app/common/FormValidationErrorAlert.tsx";
import { ReactHookFormUtil } from "@/util/reactHookFormUtil.ts";
import { ContactCreatePayload } from "@/API/Resources/v1/Contact/ContactCreate.Payload";
import { toast } from "@/components/ui/use-toast.ts";
import { ContactPersonUpdatePayloadType } from "@/API/Resources/v1/ContactPerson/ContactPersonUpdatePayloadTypes.ts";
import { contactSchema } from "@/components/app/common/ValidationSchemas/ContactAndContactPersonSchema.ts";
import { ContactPersonsList } from "@/components/app/Contacts/ContactPersonsList.tsx";

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

export default function ContactAdd(props: ContactAddProp) {
  const contact_type = props.contact_type;
  const redirect_sub_part =
    contact_type === "customer" ? "customers" : "vendors";

  const { view_contact_id, isModal } = props;

  const { contact_id_param } = useParams();
  const editContactId = useMemo(() => {
    if (contact_id_param) {
      //try to parse the number, check the return if NaN then return nothing from this memo
      const parseResult = Number.parseInt(contact_id_param ?? "");
      if (!Number.isNaN(parseResult)) {
        return parseResult;
      }
    }
    if (view_contact_id) {
      return view_contact_id;
    }
    return null;
  }, [contact_id_param, view_contact_id]);
  const isEditMode = useMemo(() => !!editContactId, [editContactId]);
  const submitButtonText = isEditMode ? "update" : "save";
  const pageHeaderText = isEditMode ? "update contact" : "new contact";
  const showCloseButton = !isModal;
  const navigate = useNavigate();

  //-------------------states-------------------
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
  const [isSavingActionInProgress, setIsSavingActionInProgress] =
    useState<boolean>(false);

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
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

  const setFormData = useCallback(
    (data: typeof editPageContactDetails) => {
      if (data) {
        setValue("contact_type", data.contact_type);
        setValue("contact_name", data.contact_name);
        setValue("company_name", data.company_name);
        setValue(
          "currency",
          makeCurrencyRSelectOptions({
            currency_code: data.currency_code,
            currency_id: data.currency_id,
            currency_name: data.currency_name,
            currency_symbol: data.currency_symbol,
          }),
        );
        if (data.contact_type === "customer") {
          setValue("contact_sub_type", data.contact_sub_type);
        }
        setValue("contact_persons", data.contact_persons);

        setValue("remarks", data.remarks);

        if (data.payment_term_id) {
          setValue(
            "payment_term",
            mapPaymentTermToRSelect({
              payment_term_id: data.payment_term_id,
              payment_term_name: data.payment_term_name,
            }),
          );
        }

        setValue("first_name", data.first_name);
        setValue("last_name", data.last_name);
        setValue("salutation", data.salutation);
        setValue("email", data.email);
        setValue("phone", data.phone);
        setValue("mobile", data.mobile);
      }
    },
    [setValue],
  );
  const loadEditPage = useCallback(() => {
    contactService
      .getContactEditPage({
        contact_id: editContactId,
      })
      .then((data) => {
        if (data.contact) {
          setFormData(data?.contact);
          setEditPageContactDetails(data?.contact);
        }
        setEditPageContent(data!);
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  }, [editContactId, setFormData]);

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

  const extractAndFormatContactPersons = useCallback(
    (formData: z.infer<typeof contactSchema>) => {
      const already_existing_contact_persons =
        editPageContactDetails?.contact_persons ?? [];

      const contactPersons = formData.contact_persons;
      const nonPrimaryContactPersons: ContactPersonCreatePayload[] =
        contactPersons
          .filter((cp) => !cp.is_primary)
          .map((cp) => ({ ...cp, is_primary: false }));

      // check if a primary contact person is present
      const primary_contact_person = already_existing_contact_persons.find(
        (cp) => cp.is_primary,
      );

      // store all contact persons in this array
      const allContactPersons: (
        | ContactPersonCreatePayload
        | ContactPersonUpdatePayloadType
      )[] = [];

      const new_primary_contact_person: ContactPersonCreatePayload = {
        salutation: formData.salutation,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        mobile: formData.mobile,
        is_primary: true,
      };
      const isPrimaryContactPersonValid = !ValidityUtil.isObjectEmpty(
        new_primary_contact_person,
        ["is_primary", "salutation"],
      );

      // if a primary contact person is present and if it is valid, then we update
      // else, we don't add it to the list of contact persons
      if (isPrimaryContactPersonValid) {
        allContactPersons.push({
          ...new_primary_contact_person,
          contact_person_id: primary_contact_person
            ? primary_contact_person.contact_person_id
            : undefined,
        });
      }
      allContactPersons.push(...nonPrimaryContactPersons);
      return allContactPersons;
    },
    [editPageContactDetails?.contact_persons],
  );

  const handleFormSubmit: SubmitHandler<z.infer<typeof contactSchema>> = async (
    data,
  ) => {
    try {
      setIsSavingActionInProgress(true);

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

      // contact_persons
      newContactBasic.contact_persons = extractAndFormatContactPersons(data);

      if (isEditMode) {
        await contactService.updateContact({
          contact_id: editContactId!,
          payload: newContactBasic,
        });
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessagesForBanner([error.message]);
      }
    } finally {
      setIsSavingActionInProgress(false);
    }
  };

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
      suggestions.push(`${salutation} ${firstName} ${lastName}`);
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
                            value={{ label: field.value, value: field.value }}
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
                            value={{ label: field.value, value: field.value }}
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

const ContactCurrencyAndOtherDetails = ({
  // taxesDropDown,
  paymentTermsDropDown,
  currenciesDropDown,
}: {
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

          {/*<FormField*/}
          {/*  name={"tax"}*/}
          {/*  render={({ field }) => (*/}
          {/*    <FormItem className={"grid grid-cols-4 items-center "}>*/}
          {/*      <FormLabel htmlFor={"tax"} className={"capitalize"}>*/}
          {/*        Tax Rate*/}
          {/*      </FormLabel>*/}
          {/*      <div className="col-span-2 flex-col">*/}
          {/*        <FormControl>*/}
          {/*          <ReactSelect*/}
          {/*            {...field}*/}
          {/*            isClearable={true}*/}
          {/*            placeholder={"Select tax"}*/}
          {/*            options={taxesDropDown}*/}
          {/*            inputId={"tax"}*/}
          {/*            classNames={reactSelectStyle}*/}
          {/*            components={{*/}
          {/*              ...reactSelectComponentOverride,*/}
          {/*            }}*/}
          {/*          />*/}
          {/*        </FormControl>*/}
          {/*      </div>*/}
          {/*    </FormItem>*/}
          {/*  )}*/}
          {/*/>*/}

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
