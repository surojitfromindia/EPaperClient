import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { useCallback, useMemo, useState } from "react";
import ChartOfAccountService, {
  AccountType,
  ChartOfAccount,
} from "@/API/Resources/v1/ChartOfAccount/ChartOfAccount.Service.ts";
import {Edit, FolderIcon, Lock, MoreVertical, Plus} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { useNavigate } from "react-router-dom";
import { OnAccountModification } from "@/components/app/ChartOfAccount/ChartOfAccountPage.tsx";
import classNames from "classnames";
import { generateTreeLine } from "@/util/accountUtil.ts";
import LoaderComponent from "@/components/app/common/LoaderComponent.tsx";

const DEPTH_OFFSET = 0;
type EditPageContent = {
  account_types: AccountType[];
  accounts_list: ChartOfAccount[];
};

interface ChartOfAccountListingProps
  extends React.HTMLAttributes<HTMLDivElement> {
  shrinkTable?: boolean;
  selectedAccountId?: number;
  accounts: ChartOfAccount[];
  isAccountsFetching: boolean;
  onAccountEditClick: (account_id: number) => void;
  onAccountAddClick: () => void;
  onAccountModificationSuccess: OnAccountModification;
}

export type { EditPageContent };
const chartOfAccountService = new ChartOfAccountService();

export function ChartOfAccountListing({
  shrinkTable = false,
  selectedAccountId,
  accounts = [],
  isAccountsFetching = true,
  onAccountModificationSuccess,
  onAccountEditClick,
  onAccountAddClick,
}: ChartOfAccountListingProps) {
  const navigate = useNavigate();
  const isLoading = isAccountsFetching;
  const [lastSelectedId, setLastSelectedId] = useState<number>();
  const onListingPage = useMemo(() => !selectedAccountId, [selectedAccountId]);

  const GiveSpace = useCallback(
    (account_depth: number, account_bar: number[], has_children: boolean) => {
      const SShape = [];
      const depth = account_depth - DEPTH_OFFSET;
      const d_n_n = shrinkTable
        ? `display-node-name-extended`
        : `display-node-name`;
      const i_n = shrinkTable
        ? `intermediary-nodes-extended`
        : `intermediary-nodes`;
      if (account_bar.length > 1) {
        const IShape = <span className={i_n}> &nbsp;&nbsp;&nbsp;&nbsp; </span>;
        const SpaceBetweenShape = <span> &nbsp;&nbsp;&nbsp;&nbsp; </span>;
        const SpaceBetweenShapeInInter = (
          <span> &nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp; </span>
        );
        let LShape = <span className={d_n_n}> &nbsp;&nbsp;&nbsp;&nbsp; </span>;
        if (has_children) {
          // if it has some children, we add more space around
          LShape = (
            <span className={d_n_n}>
              {" "}
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{" "}
            </span>
          );
        }
        for (let s = 1; s < depth; s += 1) {
          // if the number is positive, we add '|' shape
          //if not a string of spaces, number of space after "|" is smaller than regular
          if (account_bar[s] > 0) {
            SShape.push(IShape);
            SShape.push(SpaceBetweenShape);
          } else {
            SShape.push(SpaceBetweenShapeInInter);
          }
        }
        SShape.push(LShape);
      }
      let iconBasic = "h-4 w-4 mr-1 mb-0.5 inline -ml-4";
      if (has_children) {
        // prepare the folder icon, custom margin
        if (account_bar.length !== 1) {
          iconBasic += " -ml-[4px]";
        }
        SShape.push(<FolderIcon className={iconBasic} />);
      }
      return React.createElement(
        "span",
        {},
        React.Children.map(SShape, (children) => (
          <React.Fragment>{children}</React.Fragment>
        )),
      );
    },
    [shrinkTable],
  );

  const accountsWithTreeFormat = useMemo(() => {
    return generateTreeLine(accounts);
  }, [accounts]);

  const handleAccountDeleteAction = async (selected_account_ids: number[]) => {
    try {
      const accountId = selected_account_ids[0];
      await chartOfAccountService.deleteSingleChartOfAccounts({
        account_id: accountId,
      });
      onAccountModificationSuccess("delete", selected_account_ids);
    } catch (error) {
      console.log(error);
    }
  };
  const handleRowClick = (account_id: number) => {
    setLastSelectedId(account_id);
    navigate(`/app/chart_of_accounts/${account_id}`);
  };
  const handleAccountEditOptionClick = (account_id: number) => {
    onAccountEditClick(account_id);
  };
  if (isLoading) {
    return (
      <div className={"relative h-screen w-full"}>
        <LoaderComponent />
      </div>
    );
  }
  return (
    <>
      <main className={"relative flex max-h-screen flex-col border-r-1"}>
        <section
          className={
            "flex px-5 py-3  justify-between items-center shrink-0 drop-shadow-sm bg-accent-muted"
          }
        >
          <h1 className={"text-md"}>Chart of Accounts</h1>
          <Button size={"sm"} onClick={onAccountAddClick}>
            <Plus className="h-4 w-4" /> New
          </Button>
        </section>
        <section
          className={"mb-12 flex flex-col items-center overflow-y-auto grow-0"}
        >
          <Table className={"h-full"}>
            {!shrinkTable && (
              <TableHeader
                className={"bg-background shadow-sm sticky top-0 z-[1]"}
              >
                <TableRow className={"uppercase text-xs"}>
                  <TableHead className={"w-12"}>&nbsp;</TableHead>
                  <TableHead>account name</TableHead>
                  <TableHead>account code</TableHead>
                  <TableHead>account type</TableHead>
                  <TableHead>parent account name</TableHead>
                  <TableHead>&nbsp;</TableHead>
                </TableRow>
              </TableHeader>
            )}
            <TableBody>
              {accountsWithTreeFormat.map((account) => (
                <TableRow
                  key={account.account_id}
                  className={classNames(
                    account.account_id === selectedAccountId && "bg-accent",
                    account.account_id === lastSelectedId &&
                      onListingPage &&
                      "animate-twinkle",
                    "cursor-pointer",
                  )}
                >
                  <TableCell>
                    {account.is_system_account ? (
                      <Lock className={"h-4 w-4 text-gray-400"} />
                    ) : (
                      <Checkbox />
                    )}
                  </TableCell>
                  <TableCell
                    onClick={() => {
                      handleRowClick(account.account_id);
                    }}
                    className={"py-3"}
                  >
                    <>
                      <span className={"font-medium text-center "}>
                        {GiveSpace(
                          account.depth,
                          account.bar,
                          account.no_of_children > 0,
                        )}
                        <span
                          className={
                            " whitespace-nowrap inline-flex flex-col items-start align-middle "
                          }
                        >
                          <span>{account.account_name}</span>
                          {shrinkTable && (
                            <span className={"text-muted-foreground tx-xs"}>
                              {account.account_type_name_formatted}
                            </span>
                          )}
                        </span>
                      </span>
                    </>
                  </TableCell>
                  {!shrinkTable && (
                    <>
                      <TableCell
                        onClick={() => {
                          handleRowClick(account.account_id);
                        }}
                      >
                        {account.account_code}
                      </TableCell>
                      <TableCell
                        onClick={() => {
                          handleRowClick(account.account_id);
                        }}
                      >
                        {account.account_type_name_formatted}
                      </TableCell>
                      <TableCell
                        onClick={() => {
                          handleRowClick(account.account_id);
                        }}
                      >
                        {account.account_parent_name}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <MoreVertical className={"h-4 cursor-pointer"} />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            className="text-sm w-56 bg-gray-50 outline-none  p-1"
                            align={"end"}
                          >
                            <DropdownMenuItem
                              className={"menu-item-ok"}
                              role={"button"}
                              onClick={() =>
                                handleAccountEditOptionClick(account.account_id)
                              }
                            >
                              <Edit className={"h-4 w-4"} />
                              <span>Configure</span>
                            </DropdownMenuItem>
                            {
                              account.is_system_account===false &&
                              <DropdownMenuItem
                                className={"menu-item-danger"}
                                role={"button"}
                                onClick={() =>
                                  handleAccountDeleteAction([
                                    account.account_id,
                                  ])
                                }
                              >
                                <span>Delete</span>
                              </DropdownMenuItem>
                            }
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </main>
    </>
  );
}
