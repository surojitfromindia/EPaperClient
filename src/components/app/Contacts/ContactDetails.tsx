import { Button } from "@/components/ui/button.tsx";
import {
  ChevronDown,
  Edit,
  Pencil,
  PhoneIcon,
  Settings,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu.tsx";
import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { Contact, ContactBalance } from "@/API/Resources/v1/Contact/Contact";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { RNumberFormatAsText } from "@/components/app/common/RNumberFormat.tsx";
import { useAppSelector } from "@/redux/hooks.ts";
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

  const handleCreateInvoiceClick = () => {
    navigate(
      mergePathNameAndSearchParams({
        path_name: AppURLPaths.APP_PAGE.INVOICES.INVOICE_CREATE(
          "?contact_id=" + contactId.toString(),
        ),
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
                  <Button variant={"default"} className="!px-3">
                    New transaction
                    <ChevronDown className={"w-4 h-4 ml-1"} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="text-sm  bg-gray-50 outline-none  p-1"
                  align={"end"}
                >
                  <DropdownMenuItem className={"menu-item-ok"} role={"button"} onClick={handleCreateInvoiceClick}>
                    <span>Invoice</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant={"outline"} className="!px-3">
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
                    <span>Edit</span>
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
        className="mt-3 overflow-y-scroll flex-1 flex-grow z-50"
      >
        <div className={"w-full pl-4 top-0  sticky bg-background"}>
          <TabsList>
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
    <div className={"  flex flex-col sm:flex-row min-h-full text-sm px-4"}>
      <div className={"md:w-1/3 bg-gray-50 bg-opacity-70 p-4"}>
        <div>{contactDetails.company_name}</div>
        <hr className={"my-3"} />
        <ContactPersonCard contactPerson={primaryContactPerson} />

        <div className={"mt-2"}>
          <Accordion
            type="multiple"
            className="w-full"
            defaultValue={["overview", "contact_persons"]}
          >
            <AccordionItem value="contact_persons">
              <AccordionTrigger className={"hover:no-underline uppercase"}>
                {ValidityUtil.isNotEmpty(nonPrimaryContactPersons)
                  ? `Contact Persons (${nonPrimaryContactPersons.length})`
                  : "Contact Persons"}
              </AccordionTrigger>
              <AccordionContent>
                <div className={"flex space-y-6 flex-col"}>
                  {ValidityUtil.isEmpty(nonPrimaryContactPersons) ? (
                    <div className={"text-center text-gray-500"}>
                      No Contact Person Found
                    </div>
                  ) : (
                    nonPrimaryContactPersons.map((contactPerson) => (
                      <ContactPersonCard
                        key={contactPerson.contact_person_id}
                        contactPerson={contactPerson}
                      />
                    ))
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="overview">
              <AccordionTrigger className={"hover:no-underline uppercase"}>
                Other Details
              </AccordionTrigger>
              <AccordionContent>
                <div className={"flex space-y-6 flex-col"}>
                  <OtherDetails contactDetails={contactDetails} />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      <div className={"w-2/3 p-4"}>
        <RightSide contactDetails={contactDetails} />
      </div>
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
      <div className={"flex"}>
        <Avatar className={"h-8 w-8 mr-3 static"}>
          <AvatarFallback className={"text-primary"}>
            {contactPerson.first_name[0]}
            {contactPerson.last_name[0]}
          </AvatarFallback>
        </Avatar>
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
              <span>Edit</span>
            </DropdownMenuItem>
            {contactPerson.is_primary !== true && (
              <DropdownMenuItem
                className={"menu-item-ok"}
                role={"button"}
                onClick={() => {}}
              >
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
function OtherDetails({ contactDetails }: { contactDetails: Contact }) {
  return (
    <div className={"flex"}>
      <div className={"w-1/2 flex flex-col space-y-3 text-gray-500"}>
        {contactDetails.contact_type === "customer" && <div>Customer Type</div>}
        {ValidityUtil.isNotEmpty(contactDetails.payment_term_id) && (
          <div>Payment Terms</div>
        )}
        {<div>Default Currency</div>}
      </div>
      <div className={"flex flex-col space-y-3"}>
        {contactDetails.contact_type === "customer" && (
          <div className={"first-letter:uppercase"}>
            {contactDetails.contact_sub_type}
          </div>
        )}
        {ValidityUtil.isNotEmpty(contactDetails.payment_term_id) && (
          <div>{contactDetails.payment_term_name}</div>
        )}
        {<div>{contactDetails.currency_code}</div>}
      </div>
    </div>
  );
}

function RightSide({ contactDetails }: { contactDetails: Contact }) {
  const balanceType = useMemo(
    () =>
      contactDetails.contact_type === "customer" ? "receivable" : "payable",
    [contactDetails?.contact_type],
  );
  return (
    <div>
      <div className={"flex"}>
        <div>
          <div className={"text-muted-foreground"}> Payment Terms</div>
          <div className={""}>{contactDetails.payment_term_name}</div>
        </div>
      </div>
      <div className={"mt-5"}>
        <BalanceReceivableOrPayableTable
          balanceType={balanceType}
          contactDetails={contactDetails}
        />
      </div>
    </div>
  );
}

function BalanceReceivableOrPayableTable({
  contactDetails,
  balanceType,
}: {
  contactDetails: Contact;
  balanceType: "receivable" | "payable";
}) {
  const { currency_id, currency_code, currency_symbol, currency_name } =
    useAppSelector(({ organization }) => organization);

  const balances = contactDetails.balances;
  const isMultipleCurrency =
    currency_id !== contactDetails.currency_id || balances.length > 1;

  const defaultCurrencyCode = currency_code;
  const defaultCurrencySymbol = currency_symbol;
  const defaultCurrencyName = currency_name;
  return (
    <div>
      <div className={"text-lg font-medium mb-2"}>
        {balanceType === "receivable" ? "Receivables" : "Payables"}
      </div>
      <Table>
        <TableHeader>
          <TableRow className={"uppercase text-xs bg-gray-50 bg-opacity-70"}>
            <TableHead>Currency</TableHead>
            <TableHead className={"text-right"}>
              {balanceType === "receivable"
                ? "Outstanding Receivable"
                : "Outstanding Payable"}
            </TableHead>
            <TableHead className={"text-right"}>Unused credit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {balances.map((balance) => (
            <TableRow key={balance.currency_code}>
              <TableCell>
                {balance.currency_code}- {balance.currency_name}
              </TableCell>
              <TableCell className={"text-right"}>
                <RNumberFormatAsText
                  value={
                    balanceType === "receivable"
                      ? balance.outstanding_credits_receivable_amount
                      : balance.outstanding_credits_payable_amount
                  }
                  thousandSeparator={true}
                  prefix={balance.currency_symbol}
                />
              </TableCell>
              <TableCell className={"text-right"}>
                <RNumberFormatAsText
                  value={
                    balanceType === "receivable"
                      ? balance.unused_credits_receivable_amount
                      : balance.unused_credits_payable_amount
                  }
                  thousandSeparator={true}
                  prefix={balance.currency_symbol}
                />
              </TableCell>
            </TableRow>
          ))}
          {
            // if multiple currency
            isMultipleCurrency && (
              <TableRow>
                <TableCell className={"uppercase"}>
                  Total ({defaultCurrencyCode})
                </TableCell>
                <TableCell className={"text-right"}>
                  <RNumberFormatAsText
                    value={
                      balanceType === "receivable"
                        ? balances.reduce(
                            (prev, curr) =>
                              prev + curr.outstanding_credits_receivable_amount,
                            0,
                          )
                        : balances.reduce(
                            (prev, curr) =>
                              prev + curr.outstanding_credits_payable_amount,
                            0,
                          )
                    }
                    thousandSeparator={true}
                    prefix={defaultCurrencySymbol}
                  />
                </TableCell>
                <TableCell className={"text-right"}>
                  <RNumberFormatAsText
                    value={
                      balanceType === "receivable"
                        ? balances.reduce(
                            (prev, curr) =>
                              prev + curr.unused_credits_receivable_amount_bcy,
                            0,
                          )
                        : balances.reduce(
                            (prev, curr) =>
                              prev + curr.unused_credits_payable_amount_bcy,
                            0,
                          )
                    }
                    thousandSeparator={true}
                    prefix={defaultCurrencySymbol}
                  />
                </TableCell>
              </TableRow>
            )
          }
        </TableBody>
      </Table>
    </div>
  );
}

export default ContactDetails;
