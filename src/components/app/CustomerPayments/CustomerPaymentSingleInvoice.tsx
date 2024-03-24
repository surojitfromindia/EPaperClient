import { Button } from "@/components/ui/button.tsx";
import { Loader2, Settings2Icon } from "lucide-react";
import React, { useState } from "react";
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

function CustomerPaymentSingleInvoice() {
  const navigate = useNavigate();
  const { invoice_id_param } = useParams();
  const { search } = useLocation();

  const [isSavingActionInProgress, setIsSavingActionInProgress] =
    useState<boolean>(false);
  const showAutoNumberSelection = true;

  const schema = z.object({
    contact: z.object(
      {
        value: z.number(),
        label: z.string(),
      },
      {
        invalid_type_error: "Select a customer",
        required_error: "Select a customer",
      },
    ),
    is_inclusive_tax: z.boolean(),
    auto_number_group: z
      .object({
        value: z.number().optional(),
        label: z.string().optional(),
      })
      .nullable()
      .optional(),
    payment_number: z.string().trim().nonempty("Enter an invoice number"),
    generated_payment_number: z.string().optional(),

    issue_date: z.date(),

    exchange_rate: z.number().optional().nullable(),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {},
  });
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    getValues,
  } = form;

  const handleCloseClick = () => {
    navigate(
      mergePathNameAndSearchParams({
        path_name:
          AppURLPaths.APP_PAGE.INVOICES.INVOICE_DETAIL(invoice_id_param),
        search_params: search,
      }),
    );
  };

  const handleFormSubmit = async (data: z.infer<typeof schema>) => {
    // todo:
  };
  return (
    <div className={"flex flex-col h-full"}>
      <div className={"h-16 bg-mute p-5 border-b-1"}>
        <span className={"text-xl font-medium"}>Payment for INC999</span>
      </div>
      <div className={"grow"}>
        <Form {...form}>
          <form>
            <div className={"grid py-4 grid-cols-12 space-y-4 p-5 bg-accent/50"}>
              {/*Customer*/}
              <FormField
                name={"contact"}
                render={({ field }) => (
                  <FormItem
                    className={
                      "gap-x-2 grid grid-cols-12 col-span-12 items-baseline"
                    }
                  >
                    <FormLabel
                      htmlFor={"contact"}
                      className="capitalize label-required col-span-2"
                    >
                      Customer
                    </FormLabel>
                    <div className="col-span-4 flex-col">
                      <FormControl>
                        <ReactAsyncSelect
                          className={"col-span-3"}
                          {...field}
                          inputId={"contact"}
                          classNames={reactSelectStyle}
                          components={{
                            ...reactSelectComponentOverride,
                          }}
                          cacheOptions={true}
                          hideSelectedOptions={true}
                          noOptionsMessage={() => "No contact found"}
                          isDisabled={true}
                        />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
                control={control}
              />
              {/*Payment Number*/}
              <FormField
                name={"auto_number_group"}
                render={({ field }) => (
                  <FormItem
                    className={
                      "space-y-0 gap-x-2 grid grid-cols-12 col-span-12 items-center"
                    }
                  >
                    <FormLabel
                      htmlFor={"payment_number"}
                      className=" capitalize label-required col-span-2"
                    >
                      Payment#
                    </FormLabel>
                    {showAutoNumberSelection && (
                      <div className="col-span-4 flex-col">
                        <FormControl>
                          <ReactSelect
                            className={"col-span-3"}
                            options={[]}
                            {...field}
                            inputId={"auto_number_group"}
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
                    )}
                    {/**Invoice Number*/}
                    <FormControl>
                      <div className="relative col-span-3">
                        <Input
                          className="pr-10"
                          placeholder="Payment number"
                          type="text"
                          id="payment_number"
                          {...register("payment_number")}
                          onBlur={(event) => {
                            // handleInvoiceNumberOnBlur(event.target.value);
                          }}
                          onChange={() => {}}
                          disabled={true}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <Settings2Icon
                            className={"w-4 h-4 text-primary"}
                            onClick={() => {}}
                          />
                        </div>
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
      <div
        className={
          "h-16 mb-12 py-2 px-5 flex items-center space-x-2 border-t-1 "
        }
      >
        <Button
          className={"capitalize"}
          onClick={handleSubmit((data) => handleFormSubmit(data))}
        >
          {isSavingActionInProgress && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Record payment
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

export default CustomerPaymentSingleInvoice;
