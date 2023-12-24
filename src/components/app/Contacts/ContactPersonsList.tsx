import { ContactPersonCreatePayload } from "@/API/Resources/v1/ContactPerson/ContactPersonCreate.Payload";
import * as React from "react";
import { useEffect, useState } from "react";
import { ContactPerson } from "@/API/Resources/v1/ContactPerson/ContactPerson";
import { ValidityUtil } from "@/util/ValidityUtil.ts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import AutoComplete from "@/components/app/common/AutoCompleteInputable.tsx";
import { SALUTATION } from "@/constants/Contact.Constants.ts";
import { Input } from "@/components/ui/input.tsx";
import { PlusCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Contact } from "@/API/Resources/v1/Contact/Contact";
type ContactPersonListProps = {
  contactDetails?: Contact;
  onContactPersonUpdate: (
    contact_persons: (ContactPerson | ContactPersonCreatePayload)[],
  ) => void;
};
export const ContactPersonsList = ({
  contactDetails,
  onContactPersonUpdate,
}: ContactPersonListProps) => {
  const BLANK_CONTACT_PERSON: ContactPersonCreatePayload = {
    salutation: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    mobile: "",
    is_primary: false,
  };
  const [contactPersons, setContactPersons] = useState<
    (ContactPerson | ContactPersonCreatePayload)[]
  >([BLANK_CONTACT_PERSON]);

  useEffect(() => {
    if (ValidityUtil.isNotEmpty(contactDetails?.contact_persons)) {
      const nonPrimaryContactPersons = contactDetails.contact_persons.filter(
        (cp) => !cp.is_primary,
      );
      if (nonPrimaryContactPersons.length === 0) {
        setContactPersons([BLANK_CONTACT_PERSON]);
      } else {
        setContactPersons(nonPrimaryContactPersons);
      }
    }
  }, [contactDetails]);

  const handleAddNewContactPerson = () => {
    setContactPersons((prev) => [...prev, BLANK_CONTACT_PERSON]);
  };

  const handleRemoveContactPerson = (index: number) => {
    if (contactPersons.length === 1) return;
    setContactPersons((prev) => {
      const newContactPersons = [...prev];
      newContactPersons.splice(index, 1);
      onContactPersonUpdate(newContactPersons);
      return newContactPersons;
    });
  };
  console.log("all contact persons", contactPersons);

  type InputControlFieldName =
    | "salutation"
    | "first_name"
    | "last_name"
    | "email"
    | "phone"
    | "mobile";
  const handleFieldChange = (
    index: number,
    field: InputControlFieldName,
    value: string,
  ) => {
    setContactPersons((prev) => {
      const newContactPersons = [...prev];
      const modifiedContactPerson = newContactPersons[index];
      switch (field) {
        case "salutation":
          modifiedContactPerson.salutation = value;
          break;
        case "first_name":
          modifiedContactPerson.first_name = value;
          break;
        case "last_name":
          modifiedContactPerson.last_name = value;
          break;
        case "email":
          modifiedContactPerson.email = value;
          break;
        case "phone":
          modifiedContactPerson.phone = value;
          break;
        case "mobile":
          modifiedContactPerson.mobile = value;
          break;
      }

      onContactPersonUpdate(newContactPersons);
      return newContactPersons;
    });
  };

  return (
    <div>
      <Table
        className={
          "divide-y  divide-gray-200 border-y border-gray-300 max-w-[900px] "
        }
      >
        <TableHeader>
          <TableRow>
            <TableHead className={"text_thead w-[40px]"}>salutation</TableHead>
            <TableHead className={"text_thead"}>first name</TableHead>
            <TableHead className={"text_thead"}>last name</TableHead>
            <TableHead className={"text_thead"}>email</TableHead>
            <TableHead className={"text_thead"}>work phone</TableHead>
            <TableHead className={"text_thead"}>mobile phone</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contactPersons.map((contactPerson, index) => {
            return (
              <TableRow
                key={index}
                className="divide-x divide-gray-200 hover:bg-none!impotant"
              >
                <TableCell className="py-1 px-1">
                  <AutoComplete
                    options={SALUTATION}
                    emptyMessage={""}
                    placeholder={"Salutation"}
                    textInputClassNames={"w-full"}
                    onValueChange={(option) =>
                      handleFieldChange(index, "salutation", option.value)
                    }
                    value={{
                      label: contactPerson.salutation,
                      value: contactPerson.salutation,
                    }}
                    inputId={`salutation_${index}`}
                  />
                </TableCell>
                <TableCell className="py-1 px-1">
                  <Input
                    autoComplete={"off"}
                    id={`first_name_${index}`}
                    onBlur={(e) =>
                      handleFieldChange(index, "first_name", e.target.value)
                    }
                    defaultValue={contactPerson.first_name}
                  />
                </TableCell>
                <TableCell className="py-1 px-1">
                  <Input
                    autoComplete={"off"}
                    id={`last_name_${index}`}
                    onBlur={(e) =>
                      handleFieldChange(index, "last_name", e.target.value)
                    }
                    defaultValue={contactPerson.last_name}
                  />
                </TableCell>
                <TableCell className="py-1 px-1">
                  <Input
                    id={`email_${index}`}
                    onBlur={(e) =>
                      handleFieldChange(index, "email", e.target.value)
                    }
                    defaultValue={contactPerson.email}
                  />
                </TableCell>
                <TableCell className="py-1 px-1">
                  <Input
                    autoComplete={"off"}
                    id={`phone_${index}`}
                    onBlur={(e) =>
                      handleFieldChange(index, "phone", e.target.value)
                    }
                    defaultValue={contactPerson.phone}
                  />
                </TableCell>
                <TableCell className="text-right px-1 py-1">
                  <Input
                    autoComplete={"off"}
                    id={`mobile_${index}`}
                    onBlur={(e) =>
                      handleFieldChange(index, "mobile", e.target.value)
                    }
                    defaultValue={contactPerson.mobile}
                  />

                  <div className={"relative break-words"}>
                    {
                      <div className={"absolute -top-[26px]  -right-[32px] "}>
                        <XCircle
                          type={"button"}
                          className={"w-4 h-4 text-destructive cursor-pointer"}
                          onClick={() => handleRemoveContactPerson(index)}
                        />
                      </div>
                    }
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Button
        variant="secondary"
        className={"border-r-0 rounded-r-none h-8 pl-2 mt-2.5"}
        type={"button"}
        aria-description={"Add new row at the end"}
        onClick={handleAddNewContactPerson}
      >
        <PlusCircle className={"h-4 w-4 text-primary mr-1"} />
        New Contact Person
      </Button>
    </div>
  );
};
