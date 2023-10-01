import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { useMemo, useState } from "react";
import { Edit, Loader2, MoreVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { useNavigate } from "react-router-dom";
import { OnAccountModification } from "@/components/app/ChartOfAccount/ChartOfAccountPage.tsx";
import { Item, ItemTableView } from "@/API/Resources/v1/Item/Item.Service.ts";
import classNames from "classnames";
import { objectEntries } from "@/util/typedJSFunctions.ts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { RNumberFormatAsText } from "@/components/app/common/RNumberFormat.tsx";
import { useAppSelector } from "@/redux/hooks.ts";
import LoaderComponent from "@/components/app/common/LoaderComponent.tsx";

interface ItemListingProps extends React.HTMLAttributes<HTMLDivElement> {
  shrinkTable?: boolean;
  selectedItemId?: number;
  items: Item[];
  isItemsFetching: boolean;
  onItemEditClick: (item_id: number) => void;
  onItemAddClick: () => void;
  onItemModificationSuccess: OnAccountModification;
}

type TableHeaderBody = {
  label: string;
  removable: boolean;
  type: "numeric" | "text";
  prefix?: string;
  suffix?: string;
};

export function ItemListing({
  shrinkTable = false,
  selectedItemId,
  items = [],
  isItemsFetching = true,
  onItemAddClick,
}: ItemListingProps) {
  const organizationCurrencyCode = useAppSelector(
    ({ organization }) => organization.currency_code,
  );
  const navigate = useNavigate();
  const isLoading = isItemsFetching;
  // highlight row after coming from the details page
  const [lastSelectedId, setLastSelectedId] = useState<number>();
  const onListingPage = useMemo(() => !selectedItemId, [selectedItemId]);

  const handleAccountDeleteAction = async (selected_account_ids: number[]) => {
    console.log(selected_account_ids);
    // try {
    //     const accountId = selected_account_ids[0];
    //     await chartOfAccountService.deleteSingleChartOfAccounts({
    //         account_id: accountId,
    //     });
    //     onAccountModificationSuccess("delete," selected_account_ids);
    // } catch (error) {
    //     console.log(error);
    // }
  };
  const handleRowClick = (item_id: number) => {
    setLastSelectedId(item_id);
    navigate(`/app/inventory/items/${item_id}`);
  };
  const handleAccountEditOptionClick = (item_id: number) => {
    navigate(`/app/inventory/items/${item_id}/edit`);
  };

  const dynamicHeaders: Record<
    keyof Omit<ItemTableView, "name">,
    TableHeaderBody
  > = useMemo(
    () => ({
      unit: {
        label: "unit",
        removable: true,
        type: "text",
      },
      product_type_formatted: {
        label: "product type",
        removable: true,
        type: "text",
      },
      selling_price: {
        label: "rate",
        removable: true,
        type: "numeric",
        prefix: organizationCurrencyCode,
      },
      selling_description: {
        label: "description",
        removable: true,
        type: "text",
      },
      purchase_price: {
        label: "purchase price",
        removable: true,
        type: "numeric",
        prefix: organizationCurrencyCode,
      },
      purchase_description: {
        label: "purchase description",
        removable: true,
        type: "text",
      },
    }),
    [],
  );
  const dynamicHeadersAsArray = useMemo(
    () => objectEntries(dynamicHeaders),
    [dynamicHeaders],
  );
  if (isLoading) {
    return (
      <div className={"relative h-screen w-full"}>
        <LoaderComponent />
      </div>
    );
  }

  return (
    <>
      <main className={" flex max-h-screen flex-col border-r-1 h-screen"}>
        <section
          className={
            "flex px-5 py-3  justify-between items-center shrink-0 drop-shadow-sm bg-accent-muted"
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
            <Table className={"h-full "}>
              {!shrinkTable && (
                <TableHeader
                  className={"bg-background shadow-sm sticky top-0 z-[1]"}
                >
                  <TableRow className={"uppercase text-xs"}>
                    <TableHead className={"w-12"}>&nbsp;</TableHead>
                    <TableHead>name</TableHead>
                    {dynamicHeadersAsArray.map(([col_key, col]) => (
                      <TableHead key={col_key} className={classNames(
                          col.type==="numeric" && "text-right"
                      )}>
                        <div className={""}>{col.label}</div>
                      </TableHead>
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
                      item.item_id === lastSelectedId &&
                        onListingPage &&
                        "animate-twinkle",
                      "cursor-pointer h-10",
                    )}
                  >
                    <TableCell className={"w-1 align-top"}>
                      <Checkbox />
                    </TableCell>
                    <TableCell
                      onClick={() => {
                        handleRowClick(item.item_id);
                      }}
                      className={"py-3 font-medium whitespace-nowrap align-top "}
                    >
                        <span className={"w-36"}>{item.name}</span>
                    </TableCell>
                    <>
                      {!shrinkTable &&
                        dynamicHeadersAsArray.map(([col_key, col_data]) => (
                          <TableCell
                            key={col_key}
                            onClick={() => {
                              handleRowClick(item.item_id);
                            }}
                            className={classNames(
                              "align-top",
                              col_data.type === "numeric" && "text-right",
                            )}
                          >
                            <div className={"max-h-24 overflow-hidden"}>
                              {col_data.type === "text" && (item[col_key] ?? "")}
                              {col_data.type === "numeric" && (
                                  <RNumberFormatAsText
                                      prefix={
                                        item[col_key] !== 0 ? col_data.prefix : ""
                                      }
                                      value={item[col_key] ?? 0}
                                      thousandSeparator={true}
                                  />
                              )}
                            </div>

                          </TableCell>
                        ))}
                    </>
                    {!shrinkTable && (
                      <TableCell className={"align-top"}>
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
                                handleAccountEditOptionClick(item.item_id)
                              }
                            >
                              <Edit className={"h-4 w-4"} />
                              <span>Configure</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className={"menu-item-danger"}
                              role={"button"}
                              onClick={() =>
                                handleAccountDeleteAction([item.item_id])
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
