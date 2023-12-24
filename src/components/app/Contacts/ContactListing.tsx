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
import { useAppSelector } from "@/redux/hooks.ts";
import LoaderComponent from "@/components/app/common/LoaderComponent.tsx";
import {Contact} from "@/API/Resources/v1/Contact/Contact";
import {ContactTableView} from "@/API/Resources/v1/Contact/Contact.TableView";

interface ContactListingProps extends React.HTMLAttributes<HTMLDivElement> {
  contact_type: "customer" | "vendor";
  shrinkTable?: boolean;
  selectedContactId?: number;
  contacts: Contact[];
  isContactsFetching: boolean;
  onContactAddClick: () => void;
}

type TableHeaderBodyType = {
  label: string;
  removable: boolean;
  type: "numeric" | "text";
  prefix?: string;
  suffix?: string;
};

export default function ContactListing({
  contact_type,
  shrinkTable = false,
  selectedContactId,
  contacts = [],
  isContactsFetching = true,
  onContactAddClick,
}: ContactListingProps) {
  useAppSelector(
      ({ organization }) => organization.currency_symbol,
  );
  const navigate = useNavigate();
  const isLoading = isContactsFetching;
  // highlight row after coming from the details page
  const [lastSelectedId, setLastSelectedId] = useState<number>();
  const onListingPage = useMemo(() => !selectedContactId, [selectedContactId]);

  const handleAccountDeleteAction = async (selected_account_ids: number[]) => {
    console.log(selected_account_ids);
  };
  const handleRowClick = (contact_id: number) => {
    setLastSelectedId(contact_id);
    navigate(`/app/customers/${contact_id}`);
  };
  const handleAccountEditOptionClick = (contact_id: number) => {
    navigate(`/app/customers/${contact_id}/edit`);
  };

  const dynamicHeaders: Partial<
    Record<keyof ContactTableView, TableHeaderBodyType>
  > = useMemo(
    () => ({
      contact_name: {
        label: "name",
        removable: false,
        type: "text",
      },
      company_name: {
        label: "company name",
        removable: true,
        type: "text",
      },
      currency_code: {
        label: "currency",
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
          <h1 className={"text-md"}>Contacts</h1>
          <Button size={"sm"} onClick={onContactAddClick}>
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
              <TableBody>
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
                        "py-3 font-medium whitespace-nowrap align-top "
                      }
                    >
                      <span className={"w-36"}>{contact.contact_name}</span>
                    </TableCell>
                    <>
                      {!shrinkTable &&
                        dynamicHeadersAsArray.map(([col_key, col_data]) => (
                          <TableCell
                            key={col_key}
                            onClick={() => {
                              handleRowClick(contact.contact_id);
                            }}
                            className={classNames(
                              "align-top",
                              col_data.type === "numeric" && "text-right",
                            )}
                          >
                            <div className={"max-h-24 overflow-hidden"}>
                              {col_data.type === "text" &&
                                (contact[col_key] ?? "")}
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
      </main>
    </>
  );
}
