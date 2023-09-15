import React, { useCallback, useEffect, useMemo, useState } from "react";
import { EditPageContent } from "@/components/app/ChartOfAccount/ChartOfAccountListing.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button.tsx";
import { DialogHeader } from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { ModelProps } from "@/components/app/common/Modal.tsx";
import ChartOfAccountService, {
  ChartOfAccount,
} from "@/API/Resources/v1/ChartOfAccount/ChartOfAccount.Service.ts";
import ReactSelect from "react-select";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import ld from "lodash";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
interface ChartOfAccountAddProps
  extends React.HTMLAttributes<HTMLDivElement>,
    ModelProps<{ added_account: string }> {
  editAccountId?: number;
}
export default function ChartOfAccountAdd({
  editAccountId,
  onClose,
  isOpen,
}: ChartOfAccountAddProps) {
  const chartOfAccountService = new ChartOfAccountService();

  // states
  const [editPageContent, setEditPageContent] = useState<EditPageContent>({
    account_types: [],
  });
  const [, setEditPageAccountDetails] = useState<ChartOfAccount>();
  const [isLoading, setIsLoading] = useState(true);

  // memo and variables
  const dialogTitle = useMemo(
    () => (editAccountId ? "edit account" : "add account"),
    [editAccountId],
  );
  const accountTypeDropDownOptions = useMemo(() => {
    const accountTypes = editPageContent.account_types;
    return ld
      .chain(accountTypes)
      .groupBy((acc) => acc.account_group_name)
      .map((value, key) => ({
        group_name: key,
        account_types: value,
        account_group_name_formatted:
          ld.first(value)?.account_group_name_formatted,
      }))
      .map((value) => ({
        label: value.account_group_name_formatted,
        options: value.account_types.map((accountType) => ({
          label: accountType.account_type_name_formatted,
          value: accountType.account_type_name,
        })),
      }))
      .value();
  }, [editPageContent]);

  // select the first account type by default.
  const accountTypeDefaultSelect = useMemo(
    () => accountTypeDropDownOptions?.[0]?.options[0] ?? null,
    [accountTypeDropDownOptions],
  );

  const schema = z.object({
    account_type: z.object({ value: z.string() }),
    account_name: z.string().min(1),
    account_code: z.string().optional(),
    description: z.string().optional(),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const {
    register,
    handleSubmit,
    control,
    reset: resetForm,
    formState: { errors },
  } = form;

  // effects
  useEffect(() => {
    if (isOpen) {
      loadEditPage();
    }
    return () => {
      chartOfAccountService.abortGetRequest();
    };
  }, [isOpen]);

  // callbacks and functions
  const handleDialogClose = useCallback(() => {
    resetForm();
    onClose?.();
  }, []);
  const loadEditPage = useCallback(() => {
    chartOfAccountService
      .getChartOfAccountEditPage()
      .then((data) => {
        setEditPageAccountDetails(data?.chart_of_account);
        setEditPageContent({
          account_types: data?.account_types ?? [],
        });
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  }, []);

  const handleFormSubmit: SubmitHandler<z.infer<typeof schema>> = (data) => {
    console.log("FORM:");
    console.log("account type", data.account_type.value);
    console.log("account name", data.account_name);
  };

  console.log(errors);

  if (isOpen)
    return (
      <div className={"fixed inset-0 bg-white/30"}>
        {!isLoading && (
          <Dialog open={isOpen} onOpenChange={handleDialogClose} modal={false}>
            <DialogContent
              forceMount={true}
              className="sm:max-w-[700x] top-0 translate-y-0 sm:rounded-t-none md:rounded-t-none p-0"
              onPointerDownOutside={(ev) => ev.preventDefault()}
            >
              <DialogHeader className={"bg-gray-50 shadow-sm p-3"}>
                <DialogTitle className={"capitalize"}>
                  {dialogTitle}
                </DialogTitle>
                <DialogDescription></DialogDescription>
              </DialogHeader>

              <div className={"px-5 pb-5"}>
                <Form {...form}>
                  <form className="grid gap-4 py-4">
                    <FormField
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="name" className=" capitalize">
                            account type
                          </FormLabel>
                          <FormControl>
                            <ReactSelect
                              className={"col-span-3"}
                              options={accountTypeDropDownOptions}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                      name={"account_type"}
                      defaultValue={accountTypeDefaultSelect}
                      control={control}
                    />

                    <FormField
                      render={() => (
                        <FormItem>
                          <FormLabel className={"capitalize"}>
                            account name
                          </FormLabel>
                          <FormControl>
                            <Input
                              id="account_name_input"
                              placeholder={"Account name"}
                              className="col-span-3"
                              {...register("account_name")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                      name={"account_name"}
                    />

                    <FormField
                      render={() => (
                        <FormItem
                          className={
                            "flex flex-row items-start space-x-3 space-y-0"
                          }
                        >
                          <FormControl>
                            <Checkbox id="account_is_sub_account_input" />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Make this a sub account</FormLabel>
                            <FormDescription>
                              Select this option if your are creating a
                              sub-account.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                      name={"is_sub_account"}
                    />

                    <FormField
                      render={() => (
                        <FormItem>
                          <FormLabel className={"capitalize"}>
                            account code
                          </FormLabel>
                          <FormControl>
                            <Input
                              id="account_code_input"
                              placeholder={"Account code"}
                              className="col-span-3"
                              {...register("account_code")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                      name={"account_code"}
                    />
                    <FormField
                      render={() => (
                        <FormItem>
                          <FormLabel className={"capitalize"}>
                            description
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              id="description_input"
                              placeholder={"Description"}
                              className="col-span-3"
                              {...register("description")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                      name={"description"}
                    />
                  </form>
                </Form>

                <DialogFooter>
                  <Button
                    variant={"secondary"}
                    onClick={() => {
                      handleDialogClose();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit(handleFormSubmit)}>Save</Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        )}{" "}
      </div>
    );
}
