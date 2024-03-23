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
import { useLocation, useNavigate } from "react-router-dom";
import classNames from "classnames";
import { objectEntries } from "@/util/typedJSFunctions.ts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { useAppSelector } from "@/redux/hooks.ts";
import LoaderComponent from "@/components/app/common/LoaderComponent.tsx";
import { Contact } from "@/API/Resources/v1/Contact/Contact";
import { ContactTableView } from "@/API/Resources/v1/Contact/Contact.TableView";
import { JSX } from "react/jsx-runtime";
import { RNumberFormatAsText } from "@/components/app/common/RNumberFormat.tsx";
import { mergePathNameAndSearchParams } from "@/util/urlUtil.ts";
import { AppURLPaths } from "@/constants/AppURLPaths.Constants.ts";

interface ContactListingProps extends React.HTMLAttributes<HTMLDivElement> {
  contact_type: "customer" | "vendor";
  shrinkTable?: boolean;
  selectedContactId?: number;
  contacts: Contact[];
  isContactsFetching: boolean;
}

type TableHeaderBodyType = {
  label: string;
  removable: boolean;
  type: "numeric" | "text";
  prefix?: string;
  suffix?: string;
  isCurrency?: boolean;
  currencyPrefix?: (value: string) => string;
};

export default function ContactListing({
  contact_type,
  shrinkTable = false,
  selectedContactId,
  contacts = [],
  isContactsFetching = true,
}: ContactListingProps) {
  const organizationCurrencySymbol = useAppSelector(
    ({ organization }) => organization.currency_symbol,
  );
  const navigate = useNavigate();
  const { search } = useLocation();
  const isLoading = isContactsFetching;
  // highlight row after coming from the details page
  const [lastSelectedId, setLastSelectedId] = useState<number>();
  const onListingPage = useMemo(() => !selectedContactId, [selectedContactId]);

  const handleAccountDeleteAction = async (selected_account_ids: number[]) => {
    console.log(selected_account_ids);
  };
  const handleRowClick = (contact_id: number) => {
    setLastSelectedId(contact_id);
    navigate(
      mergePathNameAndSearchParams({
        path_name: AppURLPaths.APP_PAGE.CUSTOMERS.CUSTOMER_DETAIL(
          contact_id.toString(),
        ),
        search_params: search,
      }),
    );
  };
  const handleAccountEditOptionClick = (contact_id: number) => {
    navigate(
      AppURLPaths.APP_PAGE.CUSTOMERS.CUSTOMER_EDIT(contact_id.toString()),
    );
  };

  const dynamicHeaders: Partial<
    Record<keyof ContactTableView, TableHeaderBodyType>
  > = useMemo(
    () => ({
      company_name: {
        label: "company name",
        removable: true,
        type: "text",
      },
      email: {
        label: "email",
        removable: true,
        type: "text",
      },
      phone: {
        label: "phone",
        removable: true,
        type: "text",
      },
      outstanding_credits_receivable_amount: {
        label: "receivable",
        removable: true,
        type: "numeric",
        isCurrency: true,
        currencyPrefix: (value: string) => value,
      },
      unused_credits_receivable_amount: {
        label: "unused credits",
        removable: true,
        type: "numeric",
        isCurrency: true,
        currencyPrefix: (value: string) => value,
      },
      outstanding_credits_receivable_amount_bcy: {
        label: "receivable bcy",
        removable: true,
        type: "numeric",
        isCurrency: true,
        currencyPrefix: (value: string) => value,
      },
      unused_credits_receivable_amount_bcy: {
        label: "unused credits bcy",
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

  const DynamicRowElement = ({ contact }: { contact: Contact }) => {
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
        let currencySymbol = "";
        switch (col_key) {
          case "outstanding_credits_receivable_amount":
            currencySymbol = contact.currency_symbol;
            break;
          case "unused_credits_receivable_amount":
            currencySymbol = contact.currency_symbol;
            break;
          case "outstanding_credits_receivable_amount_bcy":
            currencySymbol = organizationCurrencySymbol;
            break;
          case "unused_credits_receivable_amount_bcy":
            currencySymbol = organizationCurrencySymbol;
            break;
        }

        content = (
          <RNumberFormatAsText
            prefix={col_data.currencyPrefix(currencySymbol)}
            value={contact[col_key] ?? 0}
            thousandSeparator={true}
          />
        );
      } else if (col_data.type === "numeric") {
        content = (
          <RNumberFormatAsText
            value={contact[col_key] ?? 0}
            thousandSeparator={true}
          />
        );
      } else {
        content = contact[col_key];
      }
      const tableCell = React.createElement(
        TableCell,
        {
          key: col_key,
          onClick: () => {
            handleRowClick(contact.contact_id);
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
        key: contact.contact_id,
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
      <section className={"flex flex-col items-center overflow-y-auto grow-0"}>
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
            <TableBody className={"border-t-1"}>
              {contacts.map((contact) => (
                <TableRow
                  key={contact.contact_id}
                  className={classNames(
                    contact.contact_id === selectedContactId && "bg-accent",
                    contact.contact_id === lastSelectedId &&
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
                      handleRowClick(contact.contact_id);
                    }}
                    className={
                      "py-3 font-medium whitespace-nowrap align-top flex flex-col -mt-1"
                    }
                  >
                    <span className={"w-36 link_blue"}>
                      {contact.contact_name}
                    </span>
                    {shrinkTable &&
                      <RNumberFormatAsText
                        value={
                          contact_type === "customer"
                            ? contact.outstanding_credits_receivable_amount
                            : contact.outstanding_credits_payable_amount
                        }
                        thousandSeparator={true}
                        prefix={contact.currency_symbol}
                        className={"text-muted-foreground"}
                      />
                    }
                  </TableCell>
                  <>{!shrinkTable && <DynamicRowElement contact={contact} />}</>
                  {!shrinkTable && (
                    <TableCell className={"align-top"}>
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <MoreVertical className={"h-4 cursor-pointer"} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="text-sm  bg-gray-50 outline-none  p-1"
                          align={"end"}
                        >
                          <DropdownMenuItem
                            className={"menu-item-ok"}
                            role={"button"}
                            onClick={() =>
                              handleAccountEditOptionClick(contact.contact_id)
                            }
                          >
                            <Edit className={"h-4 w-4"} />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={"menu-item-danger"}
                            role={"button"}
                            onClick={() =>
                              handleAccountDeleteAction([contact.contact_id])
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
    </>
  );
}
