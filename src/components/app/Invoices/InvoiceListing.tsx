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
import { Badge } from "@/components/ui/badge.tsx";
import { JSX } from "react/jsx-runtime";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select.tsx";

interface InvoiceTableView
  extends Pick<
    Invoice,
    | "issue_date_formatted"
    | "invoice_number"
    | "contact_name"
    | "due_date_formatted"
    | "due_days_formatted"
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
  type: "numeric" | "text" | "enum";
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
  useAppSelector(({ organization }) => organization.currency_code);
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
      due_days_formatted: {
        label: "status",
        removable: true,
        type: "enum",
      },
      contact_name: {
        label: "customer name",
        removable: true,
        type: "text",
      },
      total: {
        label: "total",
        removable: true,
        type: "numeric",
        isCurrency: true,
        currencyPrefix: (value: string) => value,
      },
    }),
    [],
  );
  const dynamicHeadersAsArray = useMemo(
    () => objectEntries(dynamicHeaders),
    [dynamicHeaders],
  );

  const DynamicRowElement = ({ invoice }: { invoice: Invoice }) => {
    // for each dynamic header, create a React element <TableCell>
    // and append it to the TableRow
    const tableCells = [];
    dynamicHeadersAsArray.forEach(([col_key, col_data]) => {
      let content:
        | string
        | number
        | boolean
        | JSX.Element
        | Iterable<React.ReactNode>;

      if (col_data.type === "numeric" && col_data.currencyPrefix) {
        content = (
          <RNumberFormatAsText
            prefix={col_data.currencyPrefix(invoice.currency_symbol)}
            value={invoice[col_key] ?? 0}
            thousandSeparator={true}
          />
        );
      } else if (col_data.type === "numeric") {
        content = (
          <RNumberFormatAsText
            value={invoice[col_key] ?? 0}
            thousandSeparator={true}
          />
        );
      } else if (col_data.type === "enum" && col_key === "due_days_formatted") {
        const due_days = invoice["due_days"];
        let color: string;
        if (invoice.transaction_status === "draft") {
          color = "bg-yellow-100 text-yellow-500 hover:bg-yellow-200";
        } else if (invoice.transaction_status === "sent" && due_days === 0) {
          color = "bg-green-100 text-green-500 hover:bg-green-200";
        } else if (invoice.transaction_status === "sent" && due_days > 0) {
          color = "bg-blue-100 text-blue-500 hover:bg-blue-200";
        } else if (invoice.transaction_status === "sent" && due_days < 0) {
          color = "bg-red-100 text-red-500 hover:bg-red-200";
        }

        content = (
          <Badge className={`${color} uppercase rounded-md`}>
            {invoice[col_key]}
          </Badge>
        );
      } else {
        content = invoice[col_key];
      }
      const tableCell = React.createElement(
        TableCell,
        {
          key: col_key,
          onClick: () => {
            handleRowClick(invoice.invoice_id);
          },
          className: classNames(
            "align-top",
            col_data.type === "numeric" && "text-right",
          ),
        },
        content,
      );
      tableCells.push(tableCell);
    });

    // create a react element <TableRow>
    return React.createElement(
      React.Fragment,
      {
        key: invoice.invoice_id,
      },
      tableCells,
    );
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
      <main className={" flex max-h-screen flex-col border-r-1 h-screen"}>
        <section
          className={
            "flex px-5 py-3  justify-between items-center shrink-0 drop-shadow-sm bg-accent-muted"
          }
        >
          <div>
            <h1 className={"text-lg"}>Invoices</h1>
            <Select value={"All"}>
              <SelectTrigger className="w-[50px] p-0 h-7 text-left focus:ring-0 bg-transparent border-0 focus:ring-offset-0">
                <SelectValue placeholder="Select filter" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="All" showTick={false}>All</SelectItem>
                  <SelectItem value="Draft" showTick={false}>Draft</SelectItem>
                  <SelectItem value="Sent" showTick={false}>Sent</SelectItem>
              </SelectContent>
            </Select>
          </div>


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
                      {!shrinkTable && <DynamicRowElement invoice={invoice} />}
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
