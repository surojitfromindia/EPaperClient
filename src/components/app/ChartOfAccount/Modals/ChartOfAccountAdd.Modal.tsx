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
  ChartOfAccountCreatePayload,
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
import { Textarea } from "@/components/ui/textarea.tsx";
import LoaderComponent from "@/components/app/common/LoaderComponent.tsx";
import { Loader2 } from "lucide-react";
import {
  reactSelectComponentOverride,
  reactSelectStyle,
} from "@/util/style/reactSelectStyle.ts";
import { OnAccountAddOrEditSuccess } from "@/components/app/ChartOfAccount/ChartOfAccountPage.tsx";

interface ChartOfAccountAddProps
  extends React.HTMLAttributes<HTMLDivElement>,
    ModelProps<{ added_account: string }> {
  editAccountId?: number;
  onActionSuccess: OnAccountAddOrEditSuccess;
}

type OptionType = {
  label: string;
  value: number;
};
const chartOfAccountService = new ChartOfAccountService();

export default function ChartOfAccountAdd({
  editAccountId,
  onClose,
  isOpen,
  onActionSuccess,
}: ChartOfAccountAddProps) {
  // states
  const [editPageContent, setEditPageContent] = useState<EditPageContent>({
    account_types: [],
    accounts_list: [],
  });
  const [editPageAccountDetails, setEditPageAccountDetails] =
    useState<ChartOfAccount>();
  const [isLoading, setIsLoading] = useState(true);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [accountsListDDOptions, setAccountsListDDOptions] = useState<
    OptionType[]
  >([]);

  // create account types drop down
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

  // form validation
  const basicSchema = z.object({
    account_type: z.object({ value: z.string().trim(), label: z.string() }),
    account_name: z.string().trim().min(1),
    account_code: z.string().trim().min(1),
    description: z.string().optional(),
  });
  const hasParentSchema = z.object({
    has_parent_account: z.literal(true),
    account_parent: z.object({ value: z.number(), label: z.string() }),
  });
  const hasNoParentSchema = z.object({
    has_parent_account: z.literal(false),
    account_parent: z.string().nullable(),
  });
  const schemaCondition = z.discriminatedUnion("has_parent_account", [
    hasParentSchema,
    hasNoParentSchema,
  ]);
  const schema = z.intersection(schemaCondition, basicSchema);
  const customErrorMap: z.ZodErrorMap = (issue, context) => {
    if (
      issue.code === z.ZodIssueCode.invalid_type &&
      issue.path[0] === "account_parent"
    ) {
      return { message: "Please select parent account" };
    }
    return { message: context.defaultError };
  };
  z.setErrorMap(customErrorMap);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      has_parent_account: false,
    },
  });
  const {
    register,
    handleSubmit,
    control,
    reset: resetForm,
    watch,
    setValue,
  } = form;
  const selectedAccountType = watch("account_type", accountTypeDefaultSelect);
  const hasParentAccount = watch("has_parent_account");

  // memo and variables
  const dialogTitle = useMemo(
    () => (editAccountId ? "edit account" : "add account"),
    [editAccountId],
  );

  // callbacks and functions
  const getAccountsListForParentDropDownOptions = useCallback(
    ({
      account_type,
      depth_of_edit_account = -1,
      id_of_edit_account,
    }: {
      account_type: string;
      depth_of_edit_account?: number;
      id_of_edit_account?: number;
    }) => {
      const allChildAccountsOfType = (account: ChartOfAccount) =>
        account.account_type_name === account_type;
      const availableParentAccounts = (account: ChartOfAccount) =>
        account.account_type_name === account_type &&
        account.depth < depth_of_edit_account;
      return editPageContent.accounts_list
        .filter((account) =>
          id_of_edit_account
            ? availableParentAccounts(account)
            : allChildAccountsOfType(account),
        )
        .map((account) => ({
          label: account.account_name,
          value: account.account_id,
        }));
    },
    [editPageContent],
  );

  const handleDialogClose = useCallback(() => {
    resetForm();
    onClose?.();
  }, [onClose, resetForm]);
  const loadEditPage = useCallback(() => {
    chartOfAccountService
      .getChartOfAccountEditPage({
        account_id: editAccountId,
      })
      .then((data) => {
        setEditPageAccountDetails(data?.chart_of_account);
        setEditPageContent({
          account_types: data?.account_types ?? [],
          accounts_list: data?.accounts_list ?? [],
        });
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  }, [editAccountId]);
  const setFormData = useCallback(
    (data: typeof editPageAccountDetails) => {
      setValue("account_name", data?.account_name ?? "");
      setValue("account_code", data?.account_code ?? "");
      setValue("account_type.value", data?.account_type_name ?? "");
      setValue("account_type.label", data?.account_type_name_formatted ?? "");

      if (data?.account_parent_id) {
        console.log("boo");
        setValue("has_parent_account", true);
        setValue("account_parent.value", data.account_parent_id);
        setValue("account_parent.label", data?.account_parent_name ?? "");
      }
    },
    [setValue],
  );

  const handleFormSubmit: SubmitHandler<z.infer<typeof schema>> = async (
    data,
  ) => {
    const chartOfAccountCreatePayload: ChartOfAccountCreatePayload = {
      account_name: data.account_name,
      account_code: data?.account_code,
      account_parent_id: null,
      account_type_name: data.account_type.value,
      description: data.description ?? "",
    };
    if (data.has_parent_account) {
      chartOfAccountCreatePayload.account_parent_id = data.account_parent.value;
    }

    try {
      setIsButtonLoading(true);
      const accountDetails = await chartOfAccountService.addChartOfAccounts({
        payload: chartOfAccountCreatePayload,
      });
      if (accountDetails && accountDetails.chart_of_account) {
        onActionSuccess?.("add", accountDetails.chart_of_account.account_id);
        handleDialogClose();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsButtonLoading(false);
    }
  };

  // effects
  useEffect(() => {
    if (isOpen) {
      loadEditPage();
    }
    return () => {
      chartOfAccountService.abortGetRequest();
    };
  }, [isOpen, loadEditPage]);

  useEffect(() => {
    if (editPageAccountDetails) {
      setFormData(editPageAccountDetails);
    }
  }, [editPageAccountDetails, setFormData]);

  useEffect(() => {
    const depthOfEditAccount = editPageAccountDetails?.depth;
    const idOfEditAccount = editPageAccountDetails?.account_id;
    setAccountsListDDOptions(
      getAccountsListForParentDropDownOptions({
        account_type: selectedAccountType?.value ?? "",
        depth_of_edit_account: depthOfEditAccount,
        id_of_edit_account: idOfEditAccount,
      }),
    );
  }, [
    selectedAccountType,
    getAccountsListForParentDropDownOptions,
    editPageAccountDetails,
  ]);

  useEffect(() => {
    setValue("account_parent", null);
    setValue("has_parent_account", false);
  }, [selectedAccountType, setValue]);

  if (isOpen)
    return (
      <div className={"fixed inset-0  backdrop z-10"}>
        {
          <Dialog open={isOpen} onOpenChange={handleDialogClose} modal={false}>
            {
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
                {isLoading && <LoaderComponent />}
                {!isLoading && (
                  <div className={"px-5 pb-5"}>
                    <Form {...form}>
                      <form className="grid gap-4 py-4">
                        <FormField
                          name={"account_type"}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel
                                htmlFor={"account_type"}
                                className=" capitalize"
                              >
                                account type
                              </FormLabel>
                              <FormControl>
                                <ReactSelect
                                  isDisabled={
                                    editPageAccountDetails?.is_system_account
                                  }
                                  className={"col-span-3"}
                                  options={accountTypeDropDownOptions}
                                  {...field}
                                  inputId={"account_type"}
                                  classNames={reactSelectStyle}
                                  components={reactSelectComponentOverride}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                          defaultValue={accountTypeDefaultSelect}
                          control={control}
                        />

                        <FormField
                          name={"account_name"}
                          render={() => (
                            <FormItem>
                              <FormLabel
                                htmlFor={"account_name_input"}
                                className={"capitalize "}
                              >
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
                        />

                        {accountsListDDOptions.length > 0 && (
                          <FormField
                            render={({ field }) => (
                              <FormItem
                                className={
                                  "flex flex-row items-start space-x-3 space-y-0"
                                }
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    id="account_is_sub_account_input"
                                    name={"account_is_sub_account_input"}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel
                                    htmlFor={"account_is_sub_account_input"}
                                  >
                                    Make this a sub account
                                  </FormLabel>
                                  <FormDescription>
                                    Select this option if your are creating a
                                    sub-account.
                                  </FormDescription>
                                </div>
                              </FormItem>
                            )}
                            name={"has_parent_account"}
                            control={control}
                          />
                        )}

                        {accountsListDDOptions.length > 0 &&
                          hasParentAccount && (
                            <FormField
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel
                                    htmlFor="account_parent_input"
                                    className=" capitalize"
                                  >
                                    parent account
                                  </FormLabel>
                                  <FormControl>
                                    <ReactSelect
                                      options={[
                                        {
                                          label: selectedAccountType.label,
                                          options: accountsListDDOptions,
                                        },
                                      ]}
                                      {...field}
                                      inputId={"account_parent_input"}
                                      classNames={reactSelectStyle}
                                      components={reactSelectComponentOverride}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                              name={"account_parent"}
                              control={control}
                            />
                          )}

                        <FormField
                          render={() => (
                            <FormItem>
                              <FormLabel
                                htmlFor={"account_code_input"}
                                className={"capitalize"}
                              >
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
                              <FormLabel
                                htmlFor={"description_input"}
                                className={"capitalize"}
                              >
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
                        disabled={isButtonLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        disabled={isButtonLoading}
                        onClick={handleSubmit(handleFormSubmit)}
                      >
                        {isButtonLoading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save
                      </Button>
                    </DialogFooter>
                  </div>
                )}
              </DialogContent>
            }
          </Dialog>
        }{" "}
      </div>
    );
}
