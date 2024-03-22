import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { useMemo, useState } from "react";
import { Edit, Loader2, MoreVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { selectCustomViewStateOfInvoice } from "@/redux/features/customView/customViewSlice.ts";
import { AppURLPaths } from "@/constants/AppURLPaths.Constants.ts";
import {
  mergePathNameAndSearchParams,
  updateOrAddSearchParam,
} from "@/util/urlUtil.ts";
import { INVOICE_DEFAULT_FILTER_BY } from "@/constants/Invoice.Constants.ts";

interface InvoiceTableView
  extends Pick<
    Invoice,
    | "issue_date_formatted"
    | "invoice_number"
    | "contact_name"
    | "due_date_formatted"
    | "due_days_formatted"
    | "total"
    | "balance"
  > {}

interface FixedTableFields
  extends Pick<Invoice, "issue_date_formatted" | "invoice_number"> {}

interface InvoiceListingProps extends React.HTMLAttributes<HTMLDivElement> {
  shrinkTable?: boolean;
  selectedInvoiceId?: number;
  invoices: Invoice[];
  isFetching: boolean;
  onInvoiceEditClick: (invoice_id: number) => void;
  onInvoiceModificationSuccess: OnInvoiceModification;
  filterBy: string;
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
  filterBy = INVOICE_DEFAULT_FILTER_BY,
}: InvoiceListingProps) {
  const NoRecordFoundMessages = {
    "Status.All": "No invoices found",
    "Status.Draft": "No draft invoices found",
    "Status.Overdue": "No overdue invoices found",
  };

  const { entity_select_columns } = useAppSelector(
    selectCustomViewStateOfInvoice,
  );
  const active_entity_select_columns = useMemo(
    () => entity_select_columns.filter((ec) => ec.default_filter_order > -1),
    [entity_select_columns],
  );

  const navigate = useNavigate();
  const { search } = useLocation();
  const isLoading = isFetching;
  // highlight row after coming from the details page
  const [lastSelectedId, setLastSelectedId] = useState<number>();
  const isOnListingPage = useMemo(
    () => !selectedInvoiceId,
    [selectedInvoiceId],
  );

  const handleAccountDeleteAction = async (selected_account_ids: number[]) => {
    console.log(selected_account_ids);
  };
  const handleRowClick = (invoice_id: number) => {
    setLastSelectedId(invoice_id);
    navigate(
      mergePathNameAndSearchParams({
        path_name: AppURLPaths.APP_PAGE.INVOICES.INVOICE_DETAIL(
          invoice_id.toString(),
        ),
        search_params: search,
      }),
    );
  };
  const handleAccountEditOptionClick = (invoice_id: number) => {
    navigate(AppURLPaths.APP_PAGE.INVOICES.INVOICE_EDIT(invoice_id.toString()));
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
      balance: {
        label: "balance due",
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
        content = (
          <BadgeTransactionStatus
            due_days={invoice.due_days}
            transaction_status={invoice.transaction_status}
            text_value={invoice[col_key]}
          />
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
      <section
        className={
          "flex flex-col items-center overflow-y-auto grow-0 border-r-1"
        }
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
                  {active_entity_select_columns.map((col) => (
                    <TableHead
                      key={col.key}
                      className={classNames(
                        col.align === "right" && "text-right",
                      )}
                    >
                      <div className={""}>{col.value}</div>
                    </TableHead>
                  ))}
                  <TableHead>&nbsp;</TableHead>
                </TableRow>
              </TableHeader>
            )}
            <TableBody className={"border-t-1"}>
              {invoices.length > 0 &&
                invoices.map((invoice) => {
                  return shrinkTable ? (
                    <TableRow
                      key={invoice.invoice_id}
                      className={classNames(
                        invoice.invoice_id === selectedInvoiceId && "bg-accent",
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
                        <InvoiceSidePanelItem invoice={invoice} />
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow
                      key={invoice.invoice_id}
                      className={classNames(
                        invoice.invoice_id === selectedInvoiceId && "bg-accent",
                        invoice.invoice_id === lastSelectedId &&
                          isOnListingPage &&
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
                          "py-3 font-medium whitespace-nowrap align-top link_blue "
                        }
                      >
                        <Link
                          to={mergePathNameAndSearchParams({
                            path_name:
                              AppURLPaths.APP_PAGE.INVOICES.INVOICE_DETAIL(
                                invoice.invoice_id.toString(),
                              ),
                            search_params: search,
                          })}
                          className={"w-36"}
                        >
                          {invoice.invoice_number}
                        </Link>
                      </TableCell>
                      <>
                        {!shrinkTable && (
                          <DynamicRowElement invoice={invoice} />
                        )}
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
                                  handleAccountEditOptionClick(
                                    invoice.invoice_id,
                                  )
                                }
                              >
                                <Edit className={"h-4 w-4"} />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className={"menu-item-danger"}
                                role={"button"}
                                onClick={() =>
                                  handleAccountDeleteAction([
                                    invoice.invoice_id,
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
                  );
                })}
              {
                // No records found
                invoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={shrinkTable ? 2 : 7}>
                      <div className={"flex justify-center"}>
                        {NoRecordFoundMessages[filterBy]}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              }
            </TableBody>
          </Table>
        )}{" "}
      </section>
    </>
  );
}

const BadgeTransactionStatus = ({
  transaction_status,
  due_days,
  text_value,
}) => {
  let color: string;
  if (transaction_status === "draft") {
    color = "bg-yellow-100 text-yellow-500 hover:bg-yellow-200";
  } else if (transaction_status === "sent" && due_days === 0) {
    color = "bg-violet-100 text-violet-500 hover:bg-violet-200";
  } else if (transaction_status === "sent" && due_days > 0) {
    color = "bg-blue-100 text-blue-500 hover:bg-blue-200";
  } else if (transaction_status === "sent" && due_days < 0) {
    color = "bg-red-100 text-red-500 hover:bg-red-200";
  }

  return (
    <Badge className={`${color} uppercase  text-xs font-medium`}>
      {text_value}
    </Badge>
  );
};
const InvoiceSidePanelItem = ({ invoice }: { invoice: Invoice }) => {
  return (
    <div className={"-mt-1"}>
      <div className={"flex justify-between"}>
        <span>{invoice.contact_name}</span>
        <span>{invoice.total_formatted}</span>
      </div>
      <div className={"flex justify-between mt-2"}>
        <div className={"flex gap-x-3"}>
          <Link
            to={AppURLPaths.APP_PAGE.INVOICES.INVOICE_DETAIL_TRANSACTIONS(
              invoice.invoice_id.toString(),
            )}
            className={"link_blue"}
          >
            {invoice.invoice_number}
          </Link>

          <div className={"text-muted-foreground"}>
            {invoice.issue_date_formatted}
          </div>
        </div>
        <div className={"text-xs"}>
          <BadgeTransactionStatus
            due_days={invoice.due_days}
            transaction_status={invoice.transaction_status}
            text_value={invoice.due_days_formatted}
          />
        </div>
      </div>
    </div>
  );
};
