import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ChartOfAccountService, {
  AccountType,
  ChartOfAccount,
} from "@/API/Resources/v1/ChartOfAccount/ChartOfAccount.Service.ts";
import { Edit, FolderIcon, Loader2, MoreVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import ChartOfAccountAdd, {
  OnAccountAddSuccess,
} from "@/components/app/ChartOfAccount/Modals/ChartOfAccountAdd.Modal.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { toast } from "@/components/ui/use-toast.ts";

const DEPTH_OFFSET = 0;
type EditPageContent = {
  account_types: AccountType[];
  accounts_list: ChartOfAccount[];
};

export type { EditPageContent };
const chartOfAccountService = new ChartOfAccountService();

export function ChartOfAccountListing() {
  const [accounts, setChartOfAccounts] = useState<ChartOfAccount[]>([]);

  const loadAccounts = useCallback(() => {
    chartOfAccountService.getChartOfAccounts().then((chartOfAccounts) => {
      setChartOfAccounts(chartOfAccounts?.chart_of_accounts ?? []);
      setIsLoading(false);
    });
  }, [chartOfAccountService]);

  useEffect(() => {
    loadAccounts();
    return () => {
      chartOfAccountService.abortGetRequest();
    };
  }, [chartOfAccountService, loadAccounts]);

  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingAccountId, setEditingAccountId] = useState<number>();
  const handleEditModalOpenCloseAction = (
    action: boolean,
    edit_account_id?: number,
  ) => {
    if (edit_account_id && action) {
      setEditingAccountId(edit_account_id);
    } else {
      setEditingAccountId(undefined);
    }
    setIsEditModalOpen(action);
  };

  const GiveSpace = (
    account_depth: number,
    account_bar: number[],
    has_children: boolean,
  ) => {
    const SShape = [];
    const depth = account_depth - DEPTH_OFFSET;
    if (account_bar.length > 1) {
      const IShape = (
        <span className={"intermediary-nodes"}> &nbsp;&nbsp;&nbsp;&nbsp; </span>
      );
      const SpaceBetweenShape = <span> &nbsp;&nbsp;&nbsp;&nbsp; </span>;
      const SpaceBetweenShapeInInter = (
        <span> &nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp; </span>
      );
      let LShape = (
        <span className={"display-node-name"}> &nbsp;&nbsp;&nbsp;&nbsp; </span>
      );
      if (has_children) {
        // if it has some children, we add more space around
        LShape = (
          <span className={"display-node-name"}>
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
  };

  const accountsWithTreeFormat = useMemo(() => {
    return generateTreeLine(accounts);
  }, [accounts]);

  const onActionSuccess = useCallback<OnAccountAddSuccess>(
    (action_type) => {
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
      }
      loadAccounts();
    },
    [loadAccounts],
  );

  return (
    <>
      <main className={"relative"}>
        <section className={"flex mb-6 justify-between"}>
          <h1 className={"text-xl"}>Chart of Accounts</h1>
          <Button
            className={"ml-2"}
            onClick={() => handleEditModalOpenCloseAction(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Account
          </Button>
        </section>
        <section className={"mb-12 flex flex-col items-center"}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {!isLoading && (
            <Table className={"h-full"}>
              <TableHeader>
                <TableRow className={"uppercase"}>
                  <TableHead>account name</TableHead>
                  <TableHead>account code</TableHead>
                  <TableHead>account type</TableHead>
                  <TableHead>parent account name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accountsWithTreeFormat.map((account) => (
                  <TableRow className={""} key={account.account_id}>
                    <TableCell>
                      <>
                        <span className={"font-medium text-center "}>
                          {GiveSpace(
                            account.depth,
                            account.bar,
                            account.no_of_children > 0,
                          )}
                          <span className={" whitespace-nowrap"}>
                            {account.account_name}
                          </span>
                        </span>
                      </>
                    </TableCell>
                    <TableCell>{account.account_code}</TableCell>
                    <TableCell>{account.account_type_name_formatted}</TableCell>
                    <TableCell>{account.account_parent_name}</TableCell>
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
                              handleEditModalOpenCloseAction(
                                true,
                                account.account_id,
                              )
                            }
                          >
                            <Edit className={"h-4 w-4"} />
                            <span>Configure</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className={"menu-item-danger"}>
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}{" "}
        </section>
        {
          <ChartOfAccountAdd
            isOpen={isEditModalOpen}
            onClose={() => handleEditModalOpenCloseAction(false)}
            editAccountId={editingAccountId}
            onActionSuccess={onActionSuccess}
          />
        }
      </main>
    </>
  );
}

const generateTreeLine = (
  flatArray: ChartOfAccount[],
  depthOffSet = DEPTH_OFFSET,
) => {
  let aux = [0];
  const newArray: ({ bar: number[] } & ChartOfAccount)[] = [];
  for (const el of flatArray) {
    if (el.depth === depthOffSet) {
      // at root we reset
      aux = [0];
      newArray.push({ ...el, bar: Array.from(aux) });
      if (el.no_of_children > 0) {
        aux.push(el.no_of_children);
      }
    } else {
      // read the last element
      const pointerDepth = el.depth - depthOffSet;
      newArray.push({ ...el, bar: Array.from(aux) });
      if (aux[pointerDepth] > 0) {
        aux[pointerDepth] -= 1;
      }
      // if it has children more than zero, then push the count
      // after updating the last element
      if (el.no_of_children > 0) {
        // either update an existing position or push
        if (pointerDepth + 1 >= aux.length) {
          aux.push(el.no_of_children);
        } else {
          aux[pointerDepth + 1] += el.no_of_children;
        }
      }
    }
  }
  return newArray;
};
