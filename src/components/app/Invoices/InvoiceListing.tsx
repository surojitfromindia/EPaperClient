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
import { OnInvoiceModification } from "@/components/app/Invoices/InvoicePage.tsx";
import { Invoice } from "@/API/Resources/v1/Invoice/Invoice.Service.ts";

interface InvoiceTableView
  extends Pick<
    Invoice,
    | "issue_date_formatted"
    | "invoice_number"
    | "contact_name"
    | "due_date_formatted"
    // | "order_number"
    | "total"
  > {}

interface FixedTableFields
  extends Pick<Invoice, "issue_date_formatted" | "invoice_number"> {}

interface InvoiceListingProps extends React.HTMLAttributes<HTMLDivElement> {
  shrinkTable?: boolean;
  selectedInvoiceId?: number;
  invoices: Invoice[];
  isFetching: boolean;
  onInvoiceEditClick: (invoice_id: number) => void;
  onInvoiceAddClick: () => void;
  onInvoiceModificationSuccess: OnInvoiceModification;
}

/**
 *
 */
type TableHeaderBody = {
  label: string;
  removable: boolean;
  type: "numeric" | "text";
  prefix?: string;
  suffix?: string;
    isCurrency?: boolean;
  currencyPrefix?: (value: string) => string;
};

export function InvoiceListing({
  shrinkTable = false,
  selectedInvoiceId,
  invoices = [],
  isFetching = true,
  onInvoiceAddClick,
}: InvoiceListingProps) {
  useAppSelector(
      ({ organization }) => organization.currency_code,
  );
  const navigate = useNavigate();
  const isLoading = isFetching;
  // highlight row after coming from the details page
  const [lastSelectedId, setLastSelectedId] = useState<number>();
  const onListingPage = useMemo(() => !selectedInvoiceId, [selectedInvoiceId]);

  const handleAccountDeleteAction = async (selected_account_ids: number[]) => {
    console.log(selected_account_ids);
  };
  const handleRowClick = (invoice_id: number) => {
    setLastSelectedId(invoice_id);
    navigate(`/app/invoices/${invoice_id}`);
  };
  const handleAccountEditOptionClick = (invoice_id: number) => {
    navigate(`/app/invoices/${invoice_id}/edit`);
  };

  const dynamicHeaders: Record<
    keyof Omit<InvoiceTableView, keyof FixedTableFields>,
    TableHeaderBody
  > = useMemo(
    () => ({
      due_date_formatted: {
        label: "due date",
        removable: true,
        type: "text",
      },
      contact_name: {
        label: "customer name",
        removable: true,
        type: "text",
      },
      // order_number: {
      //   label: "order number",
      //   removable: true,
      //   type: "text",
      // },
      total: {
        label: "total",
        removable: true,
        type: "numeric",
        isCurrency: true,
        currencyPrefix: (value:string) => value
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
          <h1 className={"text-md"}>Invoices</h1>
          <Button size={"sm"} onClick={onInvoiceAddClick}>
            <Plus className="h-4 w-4" /> New
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
                    <TableHead>issue date</TableHead>
                    <TableHead>invoice#</TableHead>
                    {dynamicHeadersAsArray.map(([col_key, col]) => (
                      <TableHead
                        key={col_key}
                        className={classNames(
                          col.type === "numeric" && "text-right",
                        )}
                      >
                        <div className={""}>{col.label}</div>
                      </TableHead>
                    ))}
                    <TableHead>&nbsp;</TableHead>
                  </TableRow>
                </TableHeader>
              )}
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow
                    key={invoice.invoice_id}
                    className={classNames(
                      invoice.invoice_id === selectedInvoiceId && "bg-accent",
                      invoice.invoice_id === lastSelectedId &&
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
                        handleRowClick(invoice.invoice_id);
                      }}
                      className={
                        "py-3 font-medium whitespace-nowrap align-top "
                      }
                    >
                      <span className={"w-36"}>
                        {invoice.issue_date_formatted}
                      </span>
                    </TableCell>
                    <TableCell
                      onClick={() => {
                        handleRowClick(invoice.invoice_id);
                      }}
                      className={
                        "py-3 font-medium whitespace-nowrap align-top "
                      }
                    >
                      <span className={"w-36"}>{invoice.invoice_number}</span>
                    </TableCell>
                    <>
                      {!shrinkTable &&
                        dynamicHeadersAsArray.map(([col_key, col_data]) => (
                          <TableCell
                            key={col_key}
                            onClick={() => {
                              handleRowClick(invoice.invoice_id);
                            }}
                            className={classNames(
                              "align-top",
                              col_data.type === "numeric" && "text-right",
                            )}
                          >
                            <div className={"max-h-24 overflow-hidden"}>
                              {col_data.type === "text" &&
                                (invoice[col_key] ?? "")}
                              {col_data.type === "numeric" && (
                                <RNumberFormatAsText
                                  prefix={
                                    (col_data.isCurrency && invoice[col_key] !== 0)
                                      ? col_data.currencyPrefix(invoice.currency_symbol)
                                      : ""
                                  }
                                  value={invoice[col_key] ?? 0}
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
                            className="text-sm bg-gray-50 outline-none  p-1"
                            align={"end"}
                          >
                            <DropdownMenuItem
                              className={"menu-item-ok"}
                              role={"button"}
                              onClick={() =>
                                handleAccountEditOptionClick(invoice.invoice_id)
                              }
                            >
                              <Edit className={"h-4 w-4"} />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className={"menu-item-danger"}
                              role={"button"}
                              onClick={() =>
                                handleAccountDeleteAction([invoice.invoice_id])
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
