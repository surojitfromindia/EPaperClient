import { Button } from "@/components/ui/button.tsx";
import { Loader2, Settings2Icon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { mergePathNameAndSearchParams } from "@/util/urlUtil.ts";
import { AppURLPaths } from "@/constants/AppURLPaths.Constants.ts";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form.tsx";
import ReactAsyncSelect from "react-select/async";
import {
  reactSelectComponentOverride,
  reactSelectStyle,
} from "@/util/style/reactSelectStyle.ts";
import ReactSelect from "react-select";
import { Input } from "@/components/ui/input.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { FormValidationErrorAlert } from "@/components/app/common/FormValidationErrorAlert.tsx";
import { ReactHookFormUtil } from "@/util/reactHookFormUtil.ts";
import { DateUtil } from "@/util/dateUtil.ts";
import { ValidityUtil } from "@/util/ValidityUtil.ts";

const defaultIssueDate = new Date();

export default function CustomerPaymentSingleInvoice() {
  const navigate = useNavigate();
  const { invoice_id_param } = useParams();
  const { search } = useLocation();

  const [isSavingActionInProgress, setIsSavingActionInProgress] = useState<boolean>(false);
  const [errorMessagesForBanner, setErrorMessagesForBanner] = useState<string[]>([]);

  const showAutoNumberSelection = true;

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
    auto_number_group: z
      .object(
        {
          value: z.number().optional(),
          label: z.string().optional(),
        },
        {
          invalid_type_error: 'Select a number series',
          required_error: 'Select a number series',
        }
      )
      .nullable()
      .optional(),
    payment_number: z
      .string({
        required_error: 'Enter payment number',
      })
      .trim()
      .nonempty('Enter payment number'),
    generated_payment_number: z.string().optional(),

    issue_date: z.date(),
    amount: z.number({
      invalid_type_error: 'Amount received should be a number',
      required_error: 'Amount received required',
    }),
    reference: z.string().optional().nullable(),
    bank_charges: z.coerce.number().optional().nullable(),
    exchange_rate: z.number().optional().nullable(),
    notes: z.string().optional().nullable(),
    payment_mode: z.object(
      {
        value: z.number().optional(),
        label: z.string().optional(),
      },
      {
        invalid_type_error: 'Select a payment mode',
        required_error: 'Select a payment mode',
      }
    ),
    account: z.object(
      {
        value: z.number().optional(),
        label: z.string().optional(),
      },
      {
        invalid_type_error: 'Select an account',
        required_error: 'Select an account',
      }
    ),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      issue_date: defaultIssueDate,
    },
  });
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = form;

  const handleCloseClick = () => {
    navigate(
      mergePathNameAndSearchParams({
        path_name: AppURLPaths.APP_PAGE.INVOICES.INVOICE_DETAIL(invoice_id_param),
        search_params: search,
      })
    );
  };

  const handleFormSubmit = async (data: z.infer<typeof schema>) => {
    // todo:
  };

  // update the error message banner
  useEffect(() => {
    if (errors) {
      setErrorMessagesForBanner(ReactHookFormUtil.deepFlatReactHookFormErrorOnlyMessage(errors));
    }
  }, [errors]);
  return (
    <div className={'flex flex-col h-full relative'}>
      <div className={'h-16 bg-background p-5 border-b-1'}>
        <span className={'text-xl font-medium'}>Payment for INC999</span>
      </div>
      <div className={'overflow-y-scroll grow'}>
        {ValidityUtil.isNotEmpty(errors) && (
          <div className={'px-5 mt-5'}>
            <FormValidationErrorAlert messages={errorMessagesForBanner} />
          </div>
        )}

        <Form {...form}>
          <form>
            <div className={'p-5 bg-accent/40'}>
              <div className={'w-11/12 max-w-[1000px] space-y-4'}>
                {/*Customer*/}
                <div>
                  <FormField
                    name={'contact'}
                    render={({ field }) => (
                      <FormItem className={'space-y-0 flex gap-x-2 items-center w-1/2'}>
                        <FormLabel htmlFor={'contact'} className="capitalize label-required w-1/3">
                          Customer
                        </FormLabel>
                        <div className=" flex-col w-7/12">
                          <FormControl>
                            <ReactAsyncSelect
                              className={'col-span-3'}
                              {...field}
                              inputId={'contact'}
                              classNames={reactSelectStyle}
                              components={{
                                ...reactSelectComponentOverride,
                              }}
                              cacheOptions={true}
                              hideSelectedOptions={true}
                              noOptionsMessage={() => 'No contact found'}
                              isDisabled={true}
                            />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                    control={control}
                  />
                </div>
                {/*Number series*/}
                <div>
                  {showAutoNumberSelection && (
                    <FormField
                      name={'auto_number_group'}
                      render={({ field }) => (
                        <FormItem className={'space-y-0 gap-x-2 flex items-center w-1/2'}>
                          <FormLabel htmlFor={'payment_number'} className=" capitalize label-required w-1/3">
                            Transaction Series
                          </FormLabel>

                          <div className="w-7/12 flex-col">
                            <FormControl>
                              <ReactSelect
                                className={'col-span-3'}
                                options={[]}
                                {...field}
                                inputId={'auto_number_group'}
                                classNames={reactSelectStyle}
                                components={{
                                  ...reactSelectComponentOverride,
                                }}
                                onChange={(value: { value: number }) => {
                                  // handleAutoNumberGroupChangeInvoiceNumberChange(
                                  //   value.value,
                                  // );
                                  // field.onChange(value);
                                }}
                              />
                            </FormControl>
                          </div>
                        </FormItem>
                      )}
                      control={control}
                    />
                  )}
                </div>
                {/*Payment Number*/}
                <div>
                  <FormField
                    name={'auto_number_group'}
                    render={({ field }) => (
                      <FormItem className={'space-y-0 gap-x-2 flex  items-center w-1/2'}>
                        <FormLabel htmlFor={'payment_number'} className=" capitalize label-required w-1/3">
                          Payment#
                        </FormLabel>

                        <FormControl>
                          <div className="relative w-7/12">
                            <Input
                              className="pr-10"
                              placeholder="Payment number"
                              type="text"
                              id="payment_number"
                              {...register('payment_number')}
                              onBlur={(event) => {
                                // handleInvoiceNumberOnBlur(event.target.value);
                              }}
                              onChange={() => {}}
                              disabled={true}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                              <Settings2Icon className={'w-4 h-4 text-primary'} onClick={() => {}} />
                            </div>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                    control={control}
                  />
                </div>
              </div>
            </div>

            <div className={'mt-5 flex p-5 w-11/12 max-w-[1000px] flex-wrap'}>
              {/*Amount received*/}
              <FormField
                name={'amount'}
                render={({ field }) => (
                  <FormItem className={'space-y-0 gap-x-2 flex  items-center w-1/2 mb-5'}>
                    <FormLabel htmlFor={'amount'} className=" capitalize label-required w-1/3">
                      Amount received
                    </FormLabel>

                    <FormControl>
                      <div className="relative w-7/12">
                        <Input
                          className="pr-10"
                          type="text"
                          id="amount"
                          {...register('amount')}
                          onBlur={(event) => {
                            // handleInvoiceNumberOnBlur(event.target.value);
                          }}
                          onChange={() => {}}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
                control={control}
              />
              {/* bank charges */}
              <FormField
                name={'bank_charges'}
                render={({ field }) => (
                  <FormItem className={'space-y-0 gap-x-2 flex  items-center w-1/2 mb-5'}>
                    <FormLabel htmlFor={'bank_charges'} className=" capitalize  w-1/3">
                      Bank charges (if any)
                    </FormLabel>

                    <FormControl>
                      <div className="relative w-7/12">
                        <Input
                          className="pr-10"
                          type="text"
                          id="bank_charges"
                          {...register('bank_charges')}
                          onBlur={(event) => {
                            // handleInvoiceNumberOnBlur(event.target.value);
                          }}
                          onChange={() => {}}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
                control={control}
              />
              <Separator className={'col-span-12 mb-10 mt-5'} />

              {/*Payment date*/}
              <FormField
                name={'issue_date'}
                render={({ field }) => (
                  <FormItem className={'space-y-0 gap-x-2 flex  items-center w-1/2 mb-5'}>
                    <FormLabel htmlFor={'issue_date'} className=" capitalize label-required w-1/3">
                      Payment date{' '}
                    </FormLabel>

                    <FormControl>
                      <div className="relative w-7/12">
                        <Input
                          className="pr-10"
                          type="date"
                          id="issue_date"
                          {...register('issue_date')}
                          onBlur={(event) => {
                            // handleInvoiceNumberOnBlur(event.target.value);
                          }}
                          onChange={() => {}}
                          value={DateUtil.Formatter(field.value).format('yyyy-MM-dd')}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
                control={control}
              />
              {/* payment mode */}
              <FormField
                name={'payment_mode'}
                render={({ field }) => (
                  <FormItem className={'space-y-0 gap-x-2 flex  items-center w-1/2 mb-5'}>
                    <FormLabel htmlFor={'payment_mode'} className=" capitalize  w-1/3">
                      Payment mode
                    </FormLabel>

                    <FormControl>
                      <div className="relative w-7/12">
                        <Input
                          className="pr-10"
                          type="text"
                          id="payment_mode"
                          {...register('payment_mode')}
                          onBlur={(event) => {
                            // handleInvoiceNumberOnBlur(event.target.value);
                          }}
                          onChange={() => {}}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
                control={control}
              />
              {/* deposit to */}
              <FormField
                name={'account'}
                render={({ field }) => (
                  <FormItem className={'space-y-0 gap-x-2 flex  items-center w-1/2 mb-5'}>
                    <FormLabel htmlFor={'account'} className=" capitalize label-required w-1/3">
                      Deposit to
                    </FormLabel>

                    <FormControl>
                      <div className="relative w-7/12">
                        <Input
                          className="pr-10"
                          type="text"
                          id="account"
                          {...register('account')}
                          onBlur={(event) => {
                            // handleInvoiceNumberOnBlur(event.target.value);
                          }}
                          onChange={() => {}}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
                control={control}
              />
              {/* reference */}
              <FormField
                name={'reference'}
                render={({ field }) => (
                  <FormItem className={'space-y-0 gap-x-2 flex  items-center w-1/2 mb-5'}>
                    <FormLabel htmlFor={'reference'} className=" capitalize  w-1/3">
                      Reference
                    </FormLabel>

                    <FormControl>
                      <div className="relative w-7/12">
                        <Input
                          className="pr-10"
                          type="text"
                          id="reference"
                          {...register('reference')}
                          onBlur={(event) => {
                            // handleInvoiceNumberOnBlur(event.target.value);
                          }}
                          onChange={() => {}}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
                control={control}
              />
              {/* notes */}
              <FormField
                name={'notes'}
                render={({ field }) => (
                  <FormItem className={'space-y-0 gap-x-2 flex  items-center w-1/2 mb-5'}>
                    <FormLabel htmlFor={'amount'} className=" capitalize  w-1/3">
                      Notes{' '}
                    </FormLabel>

                    <FormControl>
                      <div className="relative w-7/12">
                        <Textarea
                          className="pr-10"
                          id="amount"
                          {...register('notes')}
                          onBlur={(event) => {
                            // handleInvoiceNumberOnBlur(event.target.value);
                          }}
                          onChange={() => {}}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
                control={control}
              />
            </div>
          </form>
        </Form>
      </div>
      <div className={' h-16 mb-12 py-2 px-5 flex items-center space-x-2 border-t-1 z-10 bg-background '}>
        <Button className={'capitalize'} onClick={handleSubmit((data) => handleFormSubmit(data))}>
          {isSavingActionInProgress && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Record payment
        </Button>
        <Button className={'capitalize'} variant={'outline'} onClick={handleCloseClick}>
          cancel
        </Button>
      </div>
    </div>
  );
}