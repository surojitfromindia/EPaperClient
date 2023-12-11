import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Pencil } from "lucide-react";
import RNumberFormat, {
  RNumberFormatAsText,
} from "@/components/app/common/RNumberFormat.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
// type of the function "onExchangeInfoSave"
type onExchangeInfoSave = ({
  exchange_rate,
  update_all_line_items,
}: {
  exchange_rate: number;
  update_all_line_items: boolean;
}) => void;

export const ExchangeInputComponent = ({
  contactCurrencyDetails,
  exchangeRateValue,
  organizationCurrencyDetails,
  onExchangeInfoSave,
}: {
  contactCurrencyDetails: {
    currency_symbol: string;
    currency_code: string;
    currency_name: string;
  } | null;
  exchangeRateValue: number;
  organizationCurrencyDetails: {
    currency_symbol: string;
    currency_code: string;
    currency_name: string;
  } | null;
  onExchangeInfoSave: onExchangeInfoSave;
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const eRateSchema = z.object({
    exchange_rate: z.number().nonnegative("Exchange rate must be positive"),
    update_all_line_items: z.boolean(),
  });
  const form = useForm<z.infer<typeof eRateSchema>>({
    resolver: zodResolver(eRateSchema),
    defaultValues: {
      exchange_rate: exchangeRateValue,
      update_all_line_items: false,
    },
  });
  const { handleSubmit, control } = form;
  const handleFormSubmit = (data: z.infer<typeof eRateSchema>) => {
    const exchange_rate = data.exchange_rate;
    const update_all_line_items = data.update_all_line_items;
    onExchangeInfoSave?.({ exchange_rate, update_all_line_items });
    setIsPopoverOpen(false);
  };

  return (
    <div className={"flex items-center space-x-1 rounded-md bg-secondary pl-2"}>
      <div className={"text-xs font-medium "}> 1</div>
      <span className={"text-xs  font-medium capitalize text-primary"}>
        {contactCurrencyDetails?.currency_code ??
          contactCurrencyDetails?.currency_code}
      </span>
      <span>
        <ArrowRight className={"h-3 w-3 mx-1"} />
      </span>
      <RNumberFormatAsText
        className={"text-xs font-medium"}
        value={exchangeRateValue}
      />
      <Popover open={isPopoverOpen}>
        <div className={"flex items-center"}>
          <span className={"text-xs  font-medium"}>
            {organizationCurrencyDetails?.currency_code ??
              organizationCurrencyDetails?.currency_code}
          </span>
          <PopoverTrigger asChild>
            <Button
              variant="ghost_secondary"
              size={"icon"}
              className={"border-l-0 rounded-l-none h-8 w-8 ml-1"}
              type={"button"}
              aria-description={"More options on adding new rows"}
              onClick={() => setIsPopoverOpen((prev) => !prev)}
            >
              <Pencil className={"h-4 w-4"} />
            </Button>
          </PopoverTrigger>
        </div>

        <PopoverContent className="w-80" align={"end"}>
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Exchange rate</h4>
              <p className="text-sm text-muted-foreground">
                Set the exchange rate for this transaction.
              </p>
            </div>
            <Form {...form}>
              <div className="grid gap-2 mb-4">
                <div className=" w-full">
                  <FormField
                    name={"exchange_rate"}
                    render={({ field }) => (
                      <FormItem
                        className={"flex flex-row items-center space-x-2 "}
                      >
                        <FormLabel
                          htmlFor={"exchange_rate"}
                          className={"capitalize"}
                        >
                          Rate
                        </FormLabel>
                        <div className=" flex-col">
                          <FormControl>
                            <RNumberFormat
                              value={field.value}
                              id="exchange_rate"
                              onValueChange={({ floatValue }) => {
                                field.onChange(floatValue);
                              }}
                              customInput={Input}
                              getInputRef={field.ref}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <div className=" w-full flex items-center space-x-3">
                  <FormField
                    render={({ field }) => (
                      <FormItem
                        className={"flex flex-row items-start space-y-0"}
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="update_all_line_items"
                            name={"update_all_line_items"}
                            className={"inline-flex mt-1.5 mr-2"}
                          />
                        </FormControl>
                        <div className="">
                          <FormLabel
                            htmlFor={"update_all_line_items"}
                            className={" capitalize"}
                          >
                            Update all line items
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                    name={"update_all_line_items"}
                    control={control}
                  />
                </div>
              </div>

              <div className="flex justify-start">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSubmit(handleFormSubmit)}
                >
                  Save
                </Button>
              </div>
            </Form>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export type { onExchangeInfoSave };
