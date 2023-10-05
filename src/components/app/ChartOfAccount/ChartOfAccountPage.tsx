import { ChartOfAccountListing } from "@/components/app/ChartOfAccount/ChartOfAccountListing.tsx";
import { Outlet, useOutletContext, useParams } from "react-router-dom";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ChartOfAccountService, {
  ChartOfAccount,
} from "@/API/Resources/v1/ChartOfAccount/ChartOfAccount.Service.ts";
import { toast } from "@/components/ui/use-toast.ts";
import ChartOfAccountAdd from "@/components/app/ChartOfAccount/Modals/ChartOfAccountAdd.Modal.tsx";
import classNames from "classnames";
const chartOfAccountService = new ChartOfAccountService();
type OnAccountEditClick = (account_id: number) => void;
type ActionType = "delete"|"add"|"edit";
type OnAccountsDeleteSuccess = (
  action_type: Extract<ActionType,"delete">,
  account_ids: number[],
) => void;
type OnAccountAddOrEditSuccess = (
  action_type: Extract<ActionType, "add" | "edit">,
  account_id: number,
) => void;

type OnAccountModification = OnAccountAddOrEditSuccess &
  OnAccountsDeleteSuccess;
export type {
  OnAccountModification,
  OnAccountsDeleteSuccess,
  OnAccountAddOrEditSuccess,
  OnAccountEditClick,
};

type ContextType = { onAccountEditClick: OnAccountEditClick | null };

export function useAccountAddEditModal() {
  return useOutletContext<ContextType>();
}

export default function ChartOfAccountPage() {
  const { account_id } = useParams();
  const selectedAccountId = useMemo(() => {
    //try to parse the number, check the return if NaN then return nothing from this memo
    const parseResult = Number.parseInt(account_id ?? "");
    if (!Number.isNaN(parseResult)) {
      return parseResult;
    }
  }, [account_id]);
  const isDetailsPageOpen: boolean =
    selectedAccountId && selectedAccountId > 0;

  // states
  const [accounts, setChartOfAccounts] = useState<ChartOfAccount[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingAccountId, setEditingAccountId] = useState<number>();

  const closeEditModal = () => {
    setEditingAccountId(undefined);
    setIsEditModalOpen(false);
  };
  const loadAccounts = useCallback(() => {
    chartOfAccountService.getChartOfAccounts().then((chartOfAccounts) => {
      setChartOfAccounts(chartOfAccounts?.chart_of_accounts ?? []);
      setIsLoading(false);
    });
  }, []);
  const onAccountEditClick = useCallback((edit_account_id?: number) => {
    if (edit_account_id) {
      setEditingAccountId(edit_account_id);
    } else {
      setEditingAccountId(undefined);
    }
    setIsEditModalOpen((prev) => !prev);
  }, []);

  const onAccountAddClick = useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  const onAccountModificationSuccess = useCallback<OnAccountModification>(
    (action_type:ActionType) => {
      if (action_type === "add") {
        toast({
          title: "Success",
          description: "Account is added successfully",
        });
      } else if (action_type === "edit") {
        toast({
          title: "Success",
          description: "Account is updated successfully",
        });
      } else if (action_type === "delete") {
        toast({
          title: "Success",
          description: "Account is delete successfully",
        });
      }
      loadAccounts();
    },
    [loadAccounts],
  );

  // get all charts of accounts
  useEffect(() => {
    loadAccounts();
    return () => {
      chartOfAccountService.abortGetRequest();
    };
  }, [loadAccounts]);

  return (
    <>
      <div className={"grid grid-cols-8"}>
        <div
          className={classNames(
            "col-span-8",
            isDetailsPageOpen && ` hidden lg:block lg:col-span-3`,
          )}
        >
          <ChartOfAccountListing
            shrinkTable={isDetailsPageOpen}
            selectedAccountId={selectedAccountId}
            accounts={accounts}
            isAccountsFetching={isLoading}
            onAccountModificationSuccess={onAccountModificationSuccess}
            onAccountEditClick={onAccountEditClick}
            onAccountAddClick={onAccountAddClick}
          />
        </div>
        {isDetailsPageOpen && (
          <div className={"col-span-8 lg:col-span-5"}>
            <Outlet context={{ onAccountEditClick }} />
          </div>
        )}
      </div>
      {
        <ChartOfAccountAdd
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          editAccountId={editingAccountId}
          onActionSuccess={onAccountModificationSuccess}
        />
      }
    </>
  );
}
