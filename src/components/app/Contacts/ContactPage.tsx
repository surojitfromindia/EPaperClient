import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast.ts";
import classNames from "classnames";
import ContactListing from "@/components/app/Contacts/ContactListing.tsx";
import { ContactService } from "@/API/Resources/v1/Contact/Contact.Service.ts";
import { Contact } from "@/API/Resources/v1/Contact/Contact";
import PaginationSelector from "@/components/app/common/PaginationSelector.tsx";
import {Button} from "@/components/ui/button.tsx";
import {MoreVertical, Plus, RefreshCcw} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {DropdownMenuItem} from "@radix-ui/react-dropdown-menu";
import {AppURLPaths} from "@/constants/AppURLPaths.Constants.ts";

type OnItemsDeleteSuccess = (action_type: "delete", item_ids: number[]) => void;
type OnItemAddOrEditSuccess = (
  action_type: "add" | "edit",
  item_id: number,
) => void;
type OnItemModification = OnItemAddOrEditSuccess & OnItemsDeleteSuccess;

const contactService = new ContactService();

export default function ContactPage() {
  const navigate = useNavigate();
  const { contact_id_param } = useParams();
  const selectedContactId = useMemo(() => {
    //try to parse the number, check the return if NaN then return nothing from this memo
    const parseResult = Number.parseInt(contact_id_param ?? "");
    if (!Number.isNaN(parseResult)) {
      return parseResult;
    }
  }, [contact_id_param]);
  const isDetailsPageOpen: boolean = !!(
    selectedContactId && selectedContactId > 0
  );

  // states
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const loadContacts = useCallback(() => {
    contactService.getContacts().then((contacts) => {
      setContacts(contacts?.contacts ?? []);
      setIsLoading(false);
    });
  }, []);

  const handleContactAddClick = useCallback(() => {
    navigate(AppURLPaths.APP_PAGE.CUSTOMERS.CUSTOMER_CREATE);
  }, [navigate]);
  useCallback<OnItemModification>(
    (action_type: string) => {
      if (action_type === "add") {
        toast({
          title: "Success",
          description: "Contact is added successfully",
        });
      } else if (action_type === "edit") {
        toast({
          title: "Success",
          description: "Contact is updated successfully",
        });
      } else if (action_type === "delete") {
        toast({
          title: "Success",
          description: "Contact is delete successfully",
        });
      }
      loadContacts();
    },
    [loadContacts],
  );
  useEffect(() => {
    loadContacts();
    return () => {
      contactService.abortGetRequest();
    };
  }, [loadContacts]);

  const sortOptions = [
    {
      label: "Name",
      value: "name",
      order: "asc",
    },
    {
      label: "Company name",
      value: "company_name",
      order: null,
    },
    {
      label: "Email",
      value: "email",
      order: null,
    },
  ];

  const handleListRefresh = useCallback(() => {
    // todo
  }, [])

  return (
    <>
      <div className={"w-full h-full flex"}>
        <div
          className={classNames(
            "flex flex-col h-full overflow-y-auto relative shrink-0",
            !isDetailsPageOpen && "w-full",
            isDetailsPageOpen && `w-[350px]`,
          )}
        >
          <section
              className={
                "flex px-5 py-3  justify-between items-center drop-shadow-sm"
              }
          >
            <div>
              <h1 className={"text-lg"}>Customers</h1>
            </div>
            <div className={"flex gap-x-2"}>
              <Button size={"sm"} onClick={handleContactAddClick}>
                <Plus className="h-4 w-4"/> New
              </Button>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button size={"sm"} variant={"outline"} className={"shadow"}>
                    <MoreVertical className="h-4 w-4"/>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align={"end"}
                    className="text-sm bg-gray-50 outline-none  p-1 w-56"
                >
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  {sortOptions.map((option, index) => (
                      <DropdownMenuItem
                          key={index}
                          role={"button"}
                          onClick={() => console.log(option.value)}
                          className={"menu-item-ok"}
                      >
                        {option.label}
                      </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator/>
                  <DropdownMenuGroup className={"bg-green-50"}>
                    <DropdownMenuItem
                        role={"button"}
                        className={"menu-item-ok text-green-700"}
                        onClick={handleListRefresh}
                    >
                      <RefreshCcw className="h-4 w-4 mr-2"/>
                      <span>Refresh</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

          </section>
          <div className={"overflow-y-auto flex-grow"}>
            <ContactListing
                shrinkTable={isDetailsPageOpen}
                selectedContactId={selectedContactId}
                contacts={contacts}
                isContactsFetching={isLoading}
                contact_type={"customer"}
            />
            <div className={"flex justify-end px-5 mb-20 mt-5"}>
              <PaginationSelector
                  currentPage={1}
                  perPage={10}
                  hasMore={false}
                  currentRecords={contacts.length}
                  onPageChange={() => {
                  }}
                  onPerPageChange={() => {
                  }}
              />
            </div>
          </div>
        </div>
        {isDetailsPageOpen && (
            <div className={"flex-grow"}>
              <Outlet/>
            </div>
        )}
      </div>
    </>
  );
}
