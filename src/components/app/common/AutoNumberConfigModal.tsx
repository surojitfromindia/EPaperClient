import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import React, { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator.tsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form.tsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Loader2 } from "lucide-react";
import {
  AutoNumberGroup,
  AutoNumberGroupForSingleEntity,
} from "@/API/Resources/v1/AutoNumberSeries/AutoNumberSeries";
interface AutoNumberConfigModalProps {
  openModal: boolean;
  onClose: () => void;
  autoNumberFor:
    | "invoice"
    | "credit_note"
    | "customer_payment"
    | "vendor_payment";
  autoNumberGroups: AutoNumberGroupForSingleEntity[];
  selected_auto_number_group_id: AutoNumberGroup["auto_number_group_id"];
}
function AutoNumberConfigModal({
  openModal,
  onClose,
  autoNumberFor,
  autoNumberGroups,
  selected_auto_number_group_id,
}: AutoNumberConfigModalProps) {
  const labels = {
    l1: {
      invoice: "invoice",
      credit_note: "credit note",
      customer_payment: "customer payment",
    },
    modal_title: {
      invoice: "Configure Invoice Number Preferences",
      credit_note: "Configure Credit Note Number Preferences",
      customer_payment: "Configure Customer Payment Number Preferences",
    },
  };

  const AutoNumberOptions = {
    auto_number: "auto_number",
    manual_number: "manual_number",
  };
  const [isButtonLoading] = useState(false);

  const selectedAutoNumberGroup = autoNumberGroups.find(
    (autoNumberGroup) =>
      autoNumberGroup.auto_number_group_id === selected_auto_number_group_id,
  );

  const form = useForm({
    defaultValues: {
      auto_number_option: AutoNumberOptions.auto_number,
      name: selectedAutoNumberGroup.auto_number_group_name,
      prefix_string: selectedAutoNumberGroup.auto_number.prefix_string,
      next_number: selectedAutoNumberGroup?.auto_number?.next_number,
    },
  });
  const { watch, setValue } = form;
  const autoNumberOption = watch("auto_number_option");

  useEffect(() => {
    setValue(
      "prefix_string",
      selectedAutoNumberGroup?.auto_number?.prefix_string,
    );
    setValue("next_number", selectedAutoNumberGroup?.auto_number?.next_number);
  }, [selectedAutoNumberGroup, setValue]);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={openModal} onOpenChange={handleClose}>
      <DialogContent className="bg-background fixed top-0 translate-y-0 !rounded-t-none p-5">
        <DialogHeader>
          <DialogTitle>{labels.modal_title[autoNumberFor]}</DialogTitle>
        </DialogHeader>
        <div>
          <div className={"flex flex-col mb-4"}>
            <span className={"text-sm font-medium"}>
              Associated Number Series
            </span>
            <span className={"text-sm"}>
              {selectedAutoNumberGroup.auto_number_group_name}
            </span>
          </div>
          <Separator />
          <div>
            <p className={"text-sm mt-4 mb-3"}>
              {autoNumberOption === AutoNumberOptions.auto_number &&
                `Your ${labels.l1[autoNumberFor]} numbers are set on auto-generate mode to save your time. Are you sure about changing this setting?`}
              {autoNumberOption === AutoNumberOptions.manual_number &&
                `You have selected manual ${labels.l1[autoNumberFor]} numbering. Do you want us to auto-generate it for you?`}
            </p>
            <Form {...form}>
              <div>
                <FormField
                  control={form.control}
                  name="auto_number_option"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          {/*use auto number*/}
                          <FormItem className={"flex flex-col"}>
                            <div className={"flex space-x-2 items-center"}>
                              <FormControl>
                                <RadioGroupItem
                                  value={AutoNumberOptions.auto_number}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Continue auto-generating{" "}
                                {labels.l1[autoNumberFor]} numbers
                              </FormLabel>
                            </div>
                            {/*auto number input*/}
                            {autoNumberOption ===
                              AutoNumberOptions.auto_number && (
                              <div className={"flex space-x-5 mx-7"}>
                                <FormField
                                  name={"prefix_string"}
                                  render={({ field }) => (
                                    <FormItem className={"flex flex-col"}>
                                      <FormLabel className={"text-xs"}>
                                        Prefix
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          type="text"
                                          className="input"
                                          defaultValue={field.value}
                                          onChange={field.onChange}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  name={"next_number"}
                                  render={({ field }) => (
                                    <FormItem
                                      className={"flex flex-col w-[80%]"}
                                    >
                                      <FormLabel className={"text-xs"}>
                                        Number
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          type="text"
                                          className="input"
                                          defaultValue={field.value}
                                          onChange={field.onChange}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            )}
                          </FormItem>

                          {/*turn off auto number*/}
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                value={AutoNumberOptions.manual_number}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Enter {labels.l1[autoNumberFor]} numbers manually
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </div>
        </div>
        <DialogFooter>
          <Button variant={"secondary"} onClick={handleClose}>
            Cancel
          </Button>
          <Button>
            {isButtonLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
export default AutoNumberConfigModal;
