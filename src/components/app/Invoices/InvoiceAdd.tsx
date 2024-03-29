import { Button } from '@/components/ui/button.tsx';
import { Loader2, Settings2Icon, X } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form.tsx';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input.tsx';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import LoaderComponent from '@/components/app/common/LoaderComponent.tsx';
import ReactSelect from 'react-select';
import ReactAsyncSelect from 'react-select/async';
import { reactSelectComponentOverride, reactSelectStyle } from '@/util/style/reactSelectStyle.ts';
import InvoiceService, { Invoice, InvoiceEditPageContent } from '@/API/Resources/v1/Invoice/Invoice.Service.ts';
import { PaymentTerm } from '@/API/Resources/v1/PaymentTerm.ts';
import { DateUtil } from '@/util/dateUtil.ts';
import AutoCompleteService from '@/API/Resources/v1/AutoComplete.Service.ts';
import { debounce } from 'lodash';
import { Separator } from '@/components/ui/separator.tsx';
import { LineItemInputTable, LineItemRowType } from '@/components/app/common/LineItemInputTable.tsx';
import { FormValidationErrorAlert } from '@/components/app/common/FormValidationErrorAlert.tsx';
import { invoiceLineItemRowToPayloadDTO, invoiceLineItemSchema } from '@/components/app/common/ValidationSchemas/InvoiceLineItemSchema.ts';
import { InvoiceCreationPayloadType } from '@/API/Resources/v1/Invoice/InvoiceCreationPayloadTypes';
import { toast } from '@/components/ui/use-toast.ts';
import { WrappedError } from '@/API/Resources/v1/APIAxiosConfig.ts';
import { ValidityUtil } from '@/util/ValidityUtil.ts';
import { ReactHookFormUtil } from '@/util/reactHookFormUtil.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { Contact } from '@/API/Resources/v1/Contact/Contact';
import { mapAutoNumberGroupRSelectOption, mapPaymentTermToRSelect } from '@/components/app/common/reactSelectOptionCompositions.ts';
import AutoNumberConfigModal from '@/components/app/common/AutoNumberConfigModal.tsx';
import { InvoiceSettings } from '@/API/Resources/v1/Invoice/invoice';

const invoiceService = new InvoiceService();
const autoCompleteService = new AutoCompleteService();
const CUSTOM_PAYMENT_TERM = {
  label: 'CUSTOM',
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
      invalid_type_error: 'Select a customer',
      required_error: 'Select a customer',
    }
  ),
  is_inclusive_tax: z.boolean(),
  auto_number_group: z
    .object({
      value: z.number().optional(),
      label: z.string().optional(),
    })
    .nullable()
    .optional(),
  invoice_number: z.string().trim().nonempty('Enter an invoice number'),
  generated_invoice_number: z.string().optional(),
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

export default function InvoiceAdd() {
  const { invoice_id_param } = useParams();
  const { search } = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(search);

  const editInvoiceId = useMemo(() => {
    //try to parse the number, check the return if NaN then return nothing from this memo
    const parseResult = Number.parseInt(invoice_id_param ?? '');
    if (!Number.isNaN(parseResult)) {
      return parseResult;
    }
  }, [invoice_id_param]);
  const contact_id_search_param = searchParams.get('contact_id');
  const isEditMode = useMemo(() => !!editInvoiceId, [editInvoiceId]);
  const pageHeaderText = isEditMode ? 'update invoice' : 'new invoice';

  // edit page states
  const [editPageInvoiceDetails, setEditPageInvoiceDetails] = useState<Invoice>();
  const [contactDetails, setContactDetails] = useState<Contact>();
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [editPageContent, setEditPageContent] = useState<InvoiceEditPageContent>({
    taxes: [],
    units: [],
    payment_terms: [],
    line_item_accounts_list: [],
    invoice_settings: null,
  });
  const showSaveAsDraftButton = useMemo(() => {
    if (ValidityUtil.isNotEmpty(editPageInvoiceDetails)) {
      return editPageInvoiceDetails.transaction_status !== 'sent';
    }
    return true;
  }, [editPageInvoiceDetails]);

  const invoiceSettings = useMemo(() => editPageContent.invoice_settings, [editPageContent]);
  const showAutoNumberSelection = useMemo(
    () => (ValidityUtil.isNotEmpty(invoiceSettings) ? invoiceSettings.is_auto_number_enabled && !isEditMode : false),
    [invoiceSettings, isEditMode]
  );
  const [isUseManualNumberForThisTransaction, setIsUseManualNumberForThisTransaction] = useState(false);

  // loading states
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isInitialContactLoadingDone, setIsInitialContactLoadingDone] = useState<boolean>(false);
  const [isInitialLoadingInProgress, setIsInitialLoadingInProgress] = useState(false);

  const [isSavingActionInProgress, setIsSavingActionInProgress] = useState<boolean>(false);

  // default values for contact autocomplete
  const [contactDefaultList, setContactDefaultList] = useState<{ label: string; value: number }[]>([]);

  // error messages
  const [errorMessagesForBanner, setErrorMessagesForBanner] = useState<string[]>([]);

  // open the auto number modal
  const [isAutoNumberModalOpen, setIsAutoNumberModalOpen] = useState<boolean>(false);

  const handleCloseClick = () => {
    navigate('/app/invoices');
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

  const handleInvoiceSettingsLoad = useCallback(
    (invoiceSettings: InvoiceSettings) => {
      const isAutoNumberEnabled = invoiceSettings?.is_auto_number_enabled ?? false;
      const { prefix_string, next_number } = invoiceSettings.default_auto_number_group.auto_number;
      const defaultAutoNumberGroupRSelect = mapAutoNumberGroupRSelectOption(invoiceSettings.default_auto_number_group);
      setValue('auto_number_group', defaultAutoNumberGroupRSelect);

      if (isEditMode) return;
      if (isAutoNumberEnabled) {
        setValue('invoice_number', prefix_string + next_number);
        setValue('generated_invoice_number', prefix_string + next_number);
      }
    },
    [isEditMode, setValue]
  );

  const handleEditPageDetailsLoad = useCallback(
    (data: InvoiceEditPageContent) => {
      const paymentTerms = data.payment_terms;
      const defaultPaymentTerm = paymentTerms.find((term) => term.is_default);
      const defaultPaymentTermRSelect = mapPaymentTermToRSelect(defaultPaymentTerm!);
      const defaultDueDate = calculateDueDate({
        issue_date: defaultIssueDate,
        paymentTerm: defaultPaymentTerm!,
      }).due_date;

      const invoiceSettings = data.invoice_settings;
      handleInvoiceSettingsLoad(invoiceSettings!);

      if (isEditMode) return;
      setValue('issue_date', defaultIssueDate);
      setValue('due_date', defaultDueDate);
      setValue('payment_term', defaultPaymentTermRSelect);
    },
    [handleInvoiceSettingsLoad, isEditMode, setValue]
  );

  // ----------------- dropdowns -----------------
  const paymentTermsDropDown = useMemo(() => {
    const cratedPaymentTerms = editPageContent.payment_terms.map(mapPaymentTermToRSelect);
    return [...cratedPaymentTerms, CUSTOM_PAYMENT_TERM];
  }, [editPageContent.payment_terms]);
  const autoNumberGroupsDropDown = useMemo(() => {
    return editPageContent.invoice_settings?.auto_number_groups.map(mapAutoNumberGroupRSelectOption);
  }, [editPageContent.invoice_settings?.auto_number_groups]);

  // ----------------- event handlers -----------------
  const handlePaymentTermChange = useCallback(
    (selectedOption: PaymentTerm) => {
      const issue_date_watch_value = getValues('issue_date');
      if (selectedOption.is_custom) return;
      // depending on the payment term, set the due date
      const paymentTerm = selectedOption;
      const newDate = calculateDueDate({
        issue_date: issue_date_watch_value,
        paymentTerm,
      }).due_date;
      setValue('due_date', newDate);
    },
    [getValues, setValue]
  );
  const handleIssueDateChange = (date: Date) => {
    const payment_term_watch_value = getValues('payment_term');
    if (payment_term_watch_value.is_custom) return;

    // depending on the payment term, set the due date
    const newDate = calculateDueDate({
      issue_date: date,
      paymentTerm: payment_term_watch_value,
    }).due_date;
    setValue('due_date', newDate);
  };
  const handleDueDateChange = (date: Date) => {
    setValue('due_date', date);
    // on due date manual change, set the payment term to custom
    setValue('payment_term', {
      label: 'CUSTOM',
      is_custom: true,
      value: -1,
    });
  };

  const contactAutoCompleteFetch = useCallback(async (search_text: string) => {
    const auto_complete_data = await autoCompleteService.getContacts({
      search_text: search_text,
      contact_type: 'customer',
    });
    const { results } = auto_complete_data;
    return results.map((entry) => ({ label: entry.text, value: entry.id }));
  }, []);
  const handleContactAutoCompleteInitialFocus = useCallback(() => {
    if (isInitialContactLoadingDone) return;
    else {
      setIsInitialContactLoadingDone(true);
      setIsInitialLoadingInProgress(true);
      contactAutoCompleteFetch('')
        .then((data) => {
          setContactDefaultList(data);
          setIsInitialLoadingInProgress(false);
        })
        .catch((error) => console.log(error));
    }
  }, [contactAutoCompleteFetch, isInitialContactLoadingDone]);
  const handleContactAutoCompleteChange = useCallback(
    (search_text: string, callback: (arg0: { label: string; value: number }[]) => void) => {
      contactAutoCompleteFetch(search_text).then((data) => callback(data));
    },
    [contactAutoCompleteFetch]
  );

  const handleLineItemsUpdate = useCallback(
    ({ line_items, is_inclusive_tax, exchange_rate }: { line_items: LineItemRowType[]; is_inclusive_tax: boolean; exchange_rate: number }) => {
      setValue('is_inclusive_tax', is_inclusive_tax);
      setValue('line_items', line_items);
      setValue('exchange_rate', exchange_rate);
    },
    [setValue]
  );

  // load edit pages
  const loadEditPage = useCallback(() => {
    invoiceService
      .getInvoiceEditPage({
        invoice_id: editInvoiceId,
      })
      .then((data) => {
        if (ValidityUtil.isNotEmpty(data.invoice)) {
          setIsUseManualNumberForThisTransaction(true);
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
  }, [editInvoiceId, handleEditPageDetailsLoad]);
  const loadEditPageContact = useCallback(
    (contact_id: number) => {
      invoiceService
        .getInvoiceEditPageFromContact({
          contact_id: contact_id,
        })
        .then((data) => {
          // all default values are set here
          setEditPageContent(data!);
          handleEditPageDetailsLoad(data);

          const paymentTerms = data.payment_terms;

          //----contact specific details
          const contact = data.contact;
          setContactDetails(contact);
          // update exchange rate if the currency is different
          if (contact.currency_code !== contact?.currency_code) {
            setExchangeRate(1);
          }
          // update the payment term using the contact payment term
          const contactPaymentTerm = paymentTerms.find((term) => term.payment_term_id === contact.payment_term_id);
          const defaultDueDate = calculateDueDate({
            issue_date: getValues('issue_date'),
            paymentTerm: contactPaymentTerm!,
          }).due_date;
          handlePaymentTermChange(contactPaymentTerm!);

          setValue('contact', {
            label: contact.contact_name,
            value: contact.contact_id,
          });
          setValue('due_date', defaultDueDate);
          setValue('payment_term', mapPaymentTermToRSelect(contactPaymentTerm!));
        })
        .finally(() => setIsInitialLoading(false));
    },
    [getValues, handleEditPageDetailsLoad, handlePaymentTermChange, setValue]
  );

  const handleContactChange = useCallback(
    (contact_id: number) => {
      if (contact_id) {
        loadEditPageContact(contact_id);
      }
    },
    [loadEditPageContact]
  );
  const handleOnlyExchangeRateChange = useCallback(
    (exchange_rate: number) => {
      setValue('exchange_rate', exchange_rate);
    },
    [setValue]
  );

  const handleAutoNumberGroupChangeInvoiceNumberChange = useCallback(
    (group_id: number) => {
      const auto_number_group = invoiceSettings?.auto_number_groups.find((group) => group.auto_number_group_id === group_id);
      if (auto_number_group) {
        // reset the manual flag
        setIsUseManualNumberForThisTransaction(false);
        const { prefix_string, next_number } = auto_number_group.auto_number;
        setValue('invoice_number', prefix_string + next_number);
        setValue('generated_invoice_number', prefix_string + next_number);
      }
    },
    [invoiceSettings, setValue]
  );
  const handleInvoiceNumberOnBlur = useCallback(
    (value: string) => {
      // value before the change
      const inv_number_prev_value = getValues('invoice_number');
      // set the new value
      setValue('invoice_number', value);
      const inv_number_new_value = getValues('invoice_number');
      if (isEditMode) return;

      // if the new value is the same as the previous value, do nothing
      if (inv_number_new_value === inv_number_prev_value) return;

      // if the new value is different from the generated invoice number, then
      // set the isUseManualNumberForThisTransaction to true and open the modal
      if (inv_number_new_value !== getValues('generated_invoice_number')) {
        setIsUseManualNumberForThisTransaction(true);
        handleAutoNumberModalOpen();
        return;
      }
    },
    [setValue, isEditMode, getValues]
  );

  const handleInvoiceSettingsUpdate = useCallback(
    ({ settings }: { settings: InvoiceSettings }) => {
      setEditPageContent((prev) => ({
        ...prev,
        invoice_settings: settings,
      }));
      handleInvoiceSettingsLoad(settings);
    },
    [handleInvoiceSettingsLoad]
  );

  const handleFormSubmit = async (data: z.infer<typeof schema>, _event?: React.BaseSyntheticEvent, with_status: 'draft' | 'sent' = 'draft') => {
    try {
      const toastMessage = isEditMode ? 'Invoice is updated successfully' : 'Invoice is created successfully';
      setIsSavingActionInProgress(true);
      const newInvoice: InvoiceCreationPayloadType = {
        contact_id: data.contact.value,
        issue_date: data.issue_date,
        auto_number_group_id: data.auto_number_group?.value,
        due_date: data.due_date,
        payment_term_id: data.payment_term.value,
        is_inclusive_tax: data.is_inclusive_tax,
        line_items: data.line_items.map((line_item) => invoiceLineItemRowToPayloadDTO(line_item)),
        notes: data.notes,
        transaction_status: with_status,
        exchange_rate: data.exchange_rate,
      };

      if (isUseManualNumberForThisTransaction) {
        newInvoice.invoice_number = data.invoice_number;
      }

      if (isEditMode) {
        await invoiceService
          .updateInvoice({
            payload: newInvoice,
            invoice_id: editInvoiceId,
          })
          .then(() => {
            toast({
              title: 'Success',
              description: toastMessage,
            });
            navigate('/app/invoices');
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
              title: 'Success',
              description: toastMessage,
            });
            navigate('/app/invoices');
          })
          .catch((error: WrappedError) => {
            setErrorMessagesForBanner([error.message]);
          });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessagesForBanner([error.message]);
      }
    } finally {
      setIsSavingActionInProgress(false);
    }
  };

  const handleAutoNumberModalClose = () => {
    setIsAutoNumberModalOpen(false);
  };
  const handleAutoNumberModalOpen = () => {
    setIsAutoNumberModalOpen(true);
  };

  const setFormData = useCallback(
    (data: typeof editPageInvoiceDetails) => {
      setValue('contact', {
        label: data.contact_name,
        value: data.contact_id,
      });
      setValue('invoice_number', data.invoice_number);
      setValue('issue_date', new Date(data.issue_date));
      setValue('payment_term', {
        label: data.payment_term_name,
        value: data.payment_term_id,
        payment_term: data.payment_term,
        interval: data.payment_term_interval,
        is_custom: data.payment_term_id === CUSTOM_PAYMENT_TERM.value,
      });
      setValue('due_date', new Date(data.due_date));
      setValue('is_inclusive_tax', data.is_inclusive_tax);
      setValue('line_items', data.line_items);
      setValue('notes', data.notes);
      setValue('exchange_rate', data.exchange_rate);
    },
    [setValue]
  );

  // effects
  useEffect(() => {
    if (contact_id_search_param) {
      loadEditPageContact(Number.parseInt(contact_id_search_param));
    } else {
      loadEditPage();
    }
    return () => {
      invoiceService.abortGetRequest();
    };
  }, [contact_id_search_param, loadEditPage, loadEditPageContact]);

  // update the error message banner
  useEffect(() => {
    if (errors) {
      setErrorMessagesForBanner(ReactHookFormUtil.deepFlatReactHookFormErrorOnlyMessage(errors));
    }
  }, [errors]);

  if (isInitialLoading) {
    return (
      <div className={'relative h-screen w-full'}>
        <LoaderComponent />
      </div>
    );
  }

  return (
    <div className={'flex flex-col h-screen max-h-screen  justify-between'}>
      <div className={'flex-grow overflow-y-auto'}>
        <div className={'px-5 pl-3 pr-2 py-3 shadow-sm flex justify-between items-center'}>
          <span className={'text-2xl capitalize'}>{pageHeaderText}</span>
          <span>
            <Button variant={'ghost'} onClick={handleCloseClick}>
              <X className={'w-4 h-4'} />
            </Button>
          </span>
        </div>
        <div className={'px-5 mt-5'}>
          <FormValidationErrorAlert messages={errorMessagesForBanner} />
        </div>
        <Form {...form}>
          <form>
            <div className={'grid py-4 grid-cols-12 space-y-4 p-5 my-6'}>
              {/*Customer*/}
              <FormField
                name={'contact'}
                render={({ field }) => (
                  <FormItem className={'gap-x-2 grid grid-cols-12 col-span-12 items-baseline'}>
                    <FormLabel htmlFor={'contact'} className=" col-span-1 capitalize">
                      Customer
                    </FormLabel>
                    <div className="col-span-4 flex-col">
                      <FormControl>
                        <ReactAsyncSelect
                          onFocus={handleContactAutoCompleteInitialFocus}
                          className={'col-span-3'}
                          loadOptions={debounce(handleContactAutoCompleteChange, 600)}
                          defaultOptions={contactDefaultList}
                          {...field}
                          onChange={(value: { label: string; value: number }) => {
                            field.onChange(value);
                            handleContactChange(value.value);
                          }}
                          inputId={'contact'}
                          classNames={reactSelectStyle}
                          components={{
                            ...reactSelectComponentOverride,
                          }}
                          cacheOptions={true}
                          isLoading={isInitialLoadingInProgress}
                          hideSelectedOptions={true}
                          noOptionsMessage={() => 'No contact found'}
                        />
                      </FormControl>
                      {ValidityUtil.isNotEmpty(contactDetails) && (
                        <Badge className={'text-[10px] px-1 py-0.5 rounded-sm capitalize'}>{contactDetails?.currency_code}</Badge>
                      )}
                    </div>
                  </FormItem>
                )}
                control={control}
              />

              {/*Invoice Number*/}
              <div className={'grid grid-cols-12 col-span-12'}>
                <FormField
                  name={'auto_number_group'}
                  render={({ field }) => (
                    <FormItem className={'gap-x-2 grid grid-cols-12 col-span-12 items-center'}>
                      <FormLabel htmlFor={'invoice_number'} className=" capitalize">
                        Invoice#
                      </FormLabel>
                      {showAutoNumberSelection && (
                        <div className="col-span-4 flex-col">
                          <FormControl>
                            <ReactSelect
                              className={'col-span-3'}
                              options={autoNumberGroupsDropDown}
                              {...field}
                              inputId={'auto_number_group'}
                              classNames={reactSelectStyle}
                              components={{
                                ...reactSelectComponentOverride,
                              }}
                              onChange={(value: { value: number }) => {
                                handleAutoNumberGroupChangeInvoiceNumberChange(value.value);
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                        </div>
                      )}
                      {/**Invoice Number*/}
                      <FormControl>
                        <div className="relative col-span-3">
                          <Input
                            className="pr-10"
                            placeholder="Invoice number"
                            type="text"
                            id="invoice_number"
                            {...register('invoice_number')}
                            onBlur={(event) => {
                              handleInvoiceNumberOnBlur(event.target.value);
                            }}
                            onChange={() => {}}
                            disabled={invoiceSettings.is_auto_number_enabled}
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <Settings2Icon className={'w-4 h-4 text-primary'} onClick={handleAutoNumberModalOpen} />
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                  control={control}
                />

                <div className={'ml-5 col-span-4'}></div>
              </div>

              <div className={'grid grid-cols-12 col-span-12 space-x-5 mt-2.5 '}>
                <div className="col-span-3">
                  {/**Issue Date*/}
                  <FormField
                    name={'issue_date'}
                    render={({ field }) => (
                      <FormItem className={'gap-x-2 grid grid-cols-3 items-center'}>
                        <FormLabel htmlFor={'issue_date'} className="capitalize col-span-1`">
                          Issue Date
                        </FormLabel>
                        <div className="col-span-2 flex-col">
                          <FormControl>
                            <Input
                              type={'date'}
                              {...field}
                              id={'issue_date'}
                              value={DateUtil.Formatter(field.value).format('yyyy-MM-dd')}
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
                {/* payment terms */}
                <div className={'col-span-3'}>
                  <FormField
                    name={'payment_term'}
                    render={({ field }) => (
                      <FormItem className={'grid grid-cols-5 items-center '}>
                        <FormLabel htmlFor={'payment_term'} className=" capitalize">
                          Terms
                        </FormLabel>
                        <div className="col-span-4 flex-col">
                          <FormControl>
                            <ReactSelect
                              className={'col-span-3'}
                              options={paymentTermsDropDown}
                              {...field}
                              inputId={'payment_term'}
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
                <div className={'col-span-3'}>
                  <FormField
                    name={'due_date'}
                    render={({ field }) => (
                      <FormItem className={'grid grid-cols-3 items-center '}>
                        <FormLabel htmlFor={'due_date'} className=" capitalize">
                          Due Date
                        </FormLabel>
                        <div className="col-span-2 flex-col">
                          <FormControl>
                            <Input
                              type={'date'}
                              {...field}
                              id={'due_date'}
                              value={DateUtil.Formatter(field.value).format('yyyy-MM-dd')}
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

              <Separator className={'col-span-12 my-5'} />
              <div className={'mt-5 flex flex-col space-y-6 col-span-12'}>
                <LineItemInputTable
                  itemFor={'sales'}
                  onLineItemsUpdate={handleLineItemsUpdate}
                  isCreateMode={!isEditMode}
                  line_items={editPageInvoiceDetails?.line_items ?? []}
                  isTransactionInclusiveTax={getValues('is_inclusive_tax')}
                  contactDetails={contactDetails}
                  transactionExchangeRate={exchangeRate}
                  onOnlyExchangeRateChange={handleOnlyExchangeRateChange}
                  lineItemAccountsList={editPageContent.line_item_accounts_list}
                  taxesList={editPageContent.taxes}
                />
              </div>
            </div>
          </form>
        </Form>
      </div>
      <div className={'h-16 mb-12 py-2 px-5 flex space-x-2 border-t-1 '}>
        {showSaveAsDraftButton && (
          <Button variant={'outline'} className={'capitalize'} onClick={handleSubmit((data) => handleFormSubmit(data, undefined, 'draft'))}>
            {isSavingActionInProgress && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save as draft
          </Button>
        )}
        <Button className={'capitalize'} onClick={handleSubmit((data) => handleFormSubmit(data, undefined, 'sent'))}>
          {isSavingActionInProgress && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save and send
        </Button>
        <Button className={'capitalize'} variant={'outline'} onClick={handleCloseClick}>
          cancel
        </Button>
      </div>

      {/**Auto Number Modal*/}
      <AutoNumberConfigModal
        openModal={isAutoNumberModalOpen}
        onClose={handleAutoNumberModalClose}
        autoNumberFor={'invoice'}
        autoNumberGroups={invoiceSettings.auto_number_groups}
        selected_auto_number_group_id={getValues('auto_number_group')?.value ?? null}
        onPreferenceUpdate={handleInvoiceSettingsUpdate}
        isAutoNumberEnabled={invoiceSettings.is_auto_number_enabled}
        currentTransactionNumber={getValues('invoice_number')}
      />
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
    case 'regular': {
      date = dateCalculator.addDays(pt).getDate();
      break;
    }
    case 'end_of_month': {
      date = dateCalculator.endOfFewMonths(pt).getDate();
      break;
    }
    case 'end_of_day': {
      date = dateCalculator.endOfCurrentDay().getDate();
      break;
    }
  }
  return { due_date: date };
}
