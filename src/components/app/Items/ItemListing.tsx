import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { useMemo } from "react";
import { Edit, Loader2, MoreVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { useNavigate } from "react-router-dom";
import { OnAccountModification } from "@/components/app/ChartOfAccount/ChartOfAccountPage.tsx";
import { Item } from "@/API/Resources/v1/Item/Item.Service.ts";
import classNames from "classnames";
import {objectEntries} from "@/util/typedJSFunctions.ts";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@/components/ui/dropdown-menu.tsx";
import {DropdownMenuItem} from "@radix-ui/react-dropdown-menu";

interface ItemListingProps extends React.HTMLAttributes<HTMLDivElement> {
  shrinkTable?: boolean;
  selectedItemId?: number;
  items: Item[];
  isItemsFetching: boolean;
  onItemEditClick: (item_id: number) => void;
  onItemAddClick: () => void;
  onItemModificationSuccess: OnAccountModification;
}

type TableHeaderBody ={
  label:string;
  removable: boolean;
  type?: "numeric",
}

export function ItemListing({
  shrinkTable = false,
  selectedItemId,
  items = [],
  isItemsFetching = true,
  onItemModificationSuccess,
  onItemEditClick,
  onItemAddClick,
}: ItemListingProps) {
  const navigate = useNavigate();
  const isLoading = isItemsFetching;

  const handleAccountDeleteAction = async (selected_account_ids: number[]) => {
    // try {
    //     const accountId = selected_account_ids[0];
    //     await chartOfAccountService.deleteSingleChartOfAccounts({
    //         account_id: accountId,
    //     });
    //     onAccountModificationSuccess("delete", selected_account_ids);
    // } catch (error) {
    //     console.log(error);
    // }
  };
  const handleRowClick = (account_id: number) => {
    // navigate(`/app/chart_of_accounts/${account_id}?i=12`);
  };
  const handleAccountEditOptionClick = (account_id: number) => {
    // onAccountEditClick(account_id);
  };


  const dynamicHeaders:Record<keyof Omit<Item,"item_id"|"product_type"|"name" >, TableHeaderBody>  = {
    unit: {
      label: "unit",
      removable: true,
    },
    product_type_formatted: {
      label: "product type",
      removable: true,
    },
    selling_price: {
      label: "rate",
      removable: true,
      type: "numeric",
    },
    selling_description: {
      label: "description",
      removable: true,
    },
    purchase_price: {
      label: "purchase price",
      removable: true,
      type: "numeric",
    },
    purchase_description: {
      label: "purchase description",
      removable: true,
    },

  };
  const dynamicHeadersAsArray = useMemo(()=>objectEntries(dynamicHeaders),[dynamicHeaders])
  return (
    <>
      <main className={"relative flex max-h-screen flex-col"}>
        <section
          className={
            "flex px-5 py-3  justify-between items-center shrink-0 drop-shadow-sm"
          }
        >
          <h1 className={"text-lg"}>Items</h1>
          <Button size={"sm"} onClick={onItemAddClick}>
            <Plus className="h-4 w-4" /> New Item
          </Button>
        </section>
        <section
          className={"mb-12 flex flex-col items-center overflow-y-auto grow-0"}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {!isLoading && (
            <Table className={"h-full"}>
              {!shrinkTable && (
                <TableHeader
                  className={"bg-background shadow-sm sticky top-0 z-[1]"}
                >
                  <TableRow className={"uppercase text-xs"}>
                    <TableHead className={"w-12"}>&nbsp;</TableHead>
                    <TableHead>name</TableHead>
                    {dynamicHeadersAsArray.map(([col_key, col]) => (
                      <TableHead key={col_key}>{col.label}</TableHead>
                    ))}
                    <TableHead>&nbsp;</TableHead>
                  </TableRow>
                </TableHeader>
              )}
              <TableBody>
                {items.map((item) => (
                  <TableRow
                    key={item.item_id}
                    className={classNames(
                      item.item_id === selectedItemId && "bg-accent",
                      "cursor-pointer",
                    )}
                  >
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell
                      onClick={() => {
                        handleRowClick(item.item_id);
                      }}
                      className={"py-3"}
                    >
                      <>
                        <span className={"font-medium text-center "}>
                          <span
                            className={
                              " whitespace-nowrap inline-flex flex-col items-start align-middle "
                            }
                          >
                            <span>{item.name}</span>
                          </span>
                        </span>
                      </>
                    </TableCell>
                    <>
                    {
                      !shrinkTable && dynamicHeadersAsArray.map(([col_key])=>(
                          <TableCell key={col_key}>
                            {item[col_key] ?? ""}</TableCell>
                      ))
                    }
                    </>
                    {!shrinkTable && (

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
                                  handleAccountEditOptionClick(
                                    item.item_id,
                                  )
                                }
                              >
                                <Edit className={"h-4 w-4"} />
                                <span>Configure</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className={"menu-item-danger"}
                                role={"button"}
                                onClick={() =>
                                  handleAccountDeleteAction([
                                    item.item_id,
                                  ])
                                }
                              >
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}{" "}
        </section>
      </main>
    </>
  );
}
