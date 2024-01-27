import { Button } from "@/components/ui/button.tsx";
import {
  ChevronDown,
  CogIcon,
  Edit,
  MoreVertical,
  Pencil,
  PhoneCall,
  PhoneIcon,
  Settings,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { Contact } from "@/API/Resources/v1/Contact/Contact";
import { ContactService } from "@/API/Resources/v1/Contact/Contact.Service.ts";
import LoaderComponent from "@/components/app/common/LoaderComponent.tsx";
import { mergePathNameAndSearchParams } from "@/util/urlUtil.ts";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.tsx";
import { AppURLPaths } from "@/constants/AppURLPaths.Constants.ts";
import { ContactPerson } from "@/API/Resources/v1/ContactPerson/ContactPerson";
import { ValidityUtil } from "@/util/ValidityUtil.ts";
import { MobileIcon } from "@radix-ui/react-icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion.tsx";
const contactService = new ContactService();
function ContactDetails() {
  const navigate = useNavigate();
  const { search, pathname } = useLocation();
  const { contact_id_param } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [contactDetails, setContactDetails] = useState<Contact>();
  const contactId = useMemo(() => {
    const parseResult = Number.parseInt(contact_id_param ?? "");
    if (!Number.isNaN(parseResult)) {
      return parseResult;
    }
  }, [contact_id_param]);
  const currentActiveTab = useMemo(() => {
    const lastPath = pathname.split("/").pop();
    switch (lastPath) {
      case "comments":
        return "comments";
      case "transactions":
        return "transactions";
      case "statement":
        return "statement";
      default:
        return "overview";
    }
  }, [pathname]);

  const loadPage = useCallback(() => {
    setIsLoading(true);
    contactService
      .getContact({
        contact_id: contactId,
      })
      .then((data) => {
        setContactDetails(data?.contact);
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  }, [contactId]);

  const handleEditClick = useCallback(() => {
    navigate(
      AppURLPaths.APP_PAGE.CUSTOMERS.CUSTOMER_EDIT(contactId.toString()),
    );
  }, [contactId, navigate]);
  const handleOverViewTabClick = () => {
    navigate(
      mergePathNameAndSearchParams({
        path_name: AppURLPaths.APP_PAGE.CUSTOMERS.CUSTOMER_DETAIL(
          contactId.toString(),
        ),
        search_params: search,
      }),
    );
  };
  const handleCommentsTabClick = () => {
    navigate(
      mergePathNameAndSearchParams({
        path_name: AppURLPaths.APP_PAGE.CUSTOMERS.CUSTOMER_DETAIL_COMMENTS(
          contactId.toString(),
        ),
        search_params: search,
      }),
    );
  };
  const handleTransactionTabClick = () => {
    navigate(
      mergePathNameAndSearchParams({
        path_name: AppURLPaths.APP_PAGE.CUSTOMERS.CUSTOMER_DETAIL_TRANSACTIONS(
          contactId.toString(),
        ),
        search_params: search,
      }),
    );
  };
  const handleCloseClick = () => {
    navigate(
      mergePathNameAndSearchParams({
        path_name: AppURLPaths.APP_PAGE.CUSTOMERS.INDEX,
        search_params: search,
      }),
    );
  };

  // effects
  useEffect(() => {
    loadPage();
    return () => {
      contactService.abortGetRequest();
    };
  }, [loadPage]);
  if (isLoading) {
    return (
      <div className={"relative h-screen"}>
        <LoaderComponent />
      </div>
    );
  }
  return (
    <main className={"flex flex-col h-screen "}>
      <section className={"pl-5 pr-2 py-3 "}>
        <div className={"flex items-center justify-between h-10"}>
          <div className={"flex flex-col"}>
            <span className={"font-medium text-xl"}>
              {contactDetails.contact_name}
            </span>
          </div>
          <div>
            <span className={"text-xs flex space-x-1"}>
              <Button
                variant={"outline"}
                size={"icon"}
                onClick={handleEditClick}
              >
                <Pencil className={"w-4 h-4"} />
              </Button>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant={"outline"}>
                    More
                    <ChevronDown className={"w-4 h-4 ml-1"} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="text-sm  bg-gray-50 outline-none  p-1"
                  align={"end"}
                >
                  <DropdownMenuItem className={"menu-item-ok"} role={"button"}>
                    <Edit className={"h-4 w-4"} />
                    <span>Configure</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={"menu-item-danger"}
                    role={"button"}
                  >
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant={"ghost"} onClick={handleCloseClick}>
                <X className={"w-4 h-4"} />
              </Button>
            </span>
          </div>
        </div>
      </section>

      <Tabs
        defaultValue={currentActiveTab}
        className="mt-3 overflow-y-scroll flex-1 flex-grow pl-4"
      >
        <div className={"w-full top-0  sticky bg-background"}>
          <TabsList className={" "}>
            <TabsTrigger
              onClick={handleOverViewTabClick}
              value="overview"
              className={"capitalize"}
            >
              overview
            </TabsTrigger>
            <TabsTrigger
              onClick={handleCommentsTabClick}
              value="comments"
              className={"capitalize"}
            >
              comments
            </TabsTrigger>
            <TabsTrigger
              onClick={handleTransactionTabClick}
              value="transactions"
              className={"capitalize"}
            >
              transactions
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="overview" className={"h-full"}>
          <ContactOverview contactDetails={contactDetails} />
        </TabsContent>
        <TabsContent value="comments">
          <Outlet />
        </TabsContent>
        <TabsContent value="transactions">
          <Outlet />
        </TabsContent>
      </Tabs>
    </main>
  );
}

function ContactOverview({ contactDetails }: { contactDetails: Contact }) {
  const nonPrimaryContactPersons: ContactPerson[] = useMemo(() => {
    return contactDetails.contact_persons.filter(
      (cp) => cp.is_primary === false,
    );
  }, [contactDetails.contact_persons]);
  const primaryContactPerson: ContactPerson = useMemo(() => {
    return contactDetails.contact_persons.find((cp) => cp.is_primary === true);
  }, [contactDetails.contact_persons]);
  return (
    <div className={"flex min-h-full text-sm"}>
      <div className={"w-1/3 bg-gray-50 bg-opacity-70 p-4"}>
        <div>{contactDetails.company_name}</div>
        <hr className={"my-3"} />
        <ContactPersonCard contactPerson={primaryContactPerson} />

        <div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className={"hover:no-underline"}>
                Contact Persons ({nonPrimaryContactPersons.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className={"flex space-y-2 flex-col"}>
                  {nonPrimaryContactPersons.map((contactPerson) => (
                    <ContactPersonCard
                      key={contactPerson.contact_person_id}
                      contactPerson={contactPerson}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      <div className={"w-2/3 p-4"}>Right side</div>
    </div>
  );
}
function ContactPersonCard({
  contactPerson,
}: {
  contactPerson: ContactPerson;
}) {
  return (
    <div className={"flex justify-between group"}>
      <div>
        <strong>
          {contactPerson.first_name} {contactPerson.last_name}
        </strong>
        {ValidityUtil.isNotEmpty(contactPerson.email) && (
          <>
            <br />
            {contactPerson.email}
          </>
        )}
        <br />
        {ValidityUtil.isNotEmpty(contactPerson.phone) && (
          <div className={"flex"}>
            <br />
            <PhoneIcon className={"align-baseline h-4 w-4 mr-1 mt-0.5"} />
            {contactPerson.phone}
          </div>
        )}
        {ValidityUtil.isNotEmpty(contactPerson.mobile) && (
          <div className={"flex"}>
            <br />
            <MobileIcon className={"align-baseline h-4 w-4 mr-1 mt-0.5"} />
            {contactPerson.mobile}
          </div>
        )}
      </div>
      <div>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Settings
              className={
                "h-4 cursor-pointer text-gray-500 text-opacity-30 group-hover:text-opacity-100"
              }
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="text-sm  bg-gray-50 outline-none  p-1"
            align={"end"}
          >
            <DropdownMenuItem
              className={"menu-item-ok"}
              role={"button"}
              onClick={() => {}}
            >
              <Edit className={"h-4 w-4"} />
              <span>Edit</span>
            </DropdownMenuItem>
            {contactPerson.is_primary !== true && (
              <DropdownMenuItem
                className={"menu-item-ok"}
                role={"button"}
                onClick={() => {}}
              >
                <Edit className={"h-4 w-4"} />
                <span>Mark As Primary</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className={"menu-item-danger"}
              role={"button"}
              onClick={() => {}}
            >
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default ContactDetails;
