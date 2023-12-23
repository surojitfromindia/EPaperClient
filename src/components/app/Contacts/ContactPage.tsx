import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast.ts";
import classNames from "classnames";
import ContactListing from "@/components/app/Contacts/ContactListing.tsx";
import { ContactService } from "@/API/Resources/v1/Contact/Contact.Service.ts";
import {Contact} from "@/API/Resources/v1/Contact/Contact";

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

  const onContactAddClick = useCallback(() => {
    navigate("/app/customers/new");
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

  return (
    <>
      <div className={"grid grid-cols-8"}>
        <div
          className={classNames(
            "col-span-8",
            isDetailsPageOpen && ` hidden lg:block lg:col-span-3`,
          )}
        >
          <ContactListing
            shrinkTable={isDetailsPageOpen}
            selectedContactId={selectedContactId}
            contacts={contacts}
            isContactsFetching={isLoading}
            onContactAddClick={onContactAddClick}
            contact_type={"customer"}
          />
        </div>
        {isDetailsPageOpen && (
          <div className={"col-span-8 lg:col-span-5"}>
            <Outlet />
          </div>
        )}
      </div>
    </>
  );
}
