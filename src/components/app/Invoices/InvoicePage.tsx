import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast.ts";
import classNames from "classnames";
import InvoiceService, {
  Invoice,
} from "@/API/Resources/v1/Invoice/Invoice.Service.ts";
import { InvoiceListing } from "@/components/app/Invoices/InvoiceListing.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Button} from "@/components/ui/button.tsx";
import {MoreVertical, Plus, RefreshCcw} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {DropdownMenuItem} from "@radix-ui/react-dropdown-menu";
import {useAppSelector} from "@/redux/hooks.ts";
import {selectCustomViewStateOfInvoice} from "@/redux/features/customView/customViewSlice.ts";
import {AppURLPaths} from "@/constants/AppURLPaths.Constants.ts";

type OnInvoiceDeleteSuccess = (
  action_type: "delete",
  invoice_ids: number[],
) => void;
type OnInvoiceAddOrEditSuccess = (
  action_type: "add" | "edit",
  invoice_id: number,
) => void;
type OnInvoiceModification = OnInvoiceAddOrEditSuccess & OnInvoiceDeleteSuccess;

const invoiceService = new InvoiceService();

export default function InvoicePage() {
  const navigate = useNavigate();
  const { invoice_id_param } = useParams();
  const selectedInvoiceId = useMemo(() => {
    const parseResult = Number.parseInt(invoice_id_param ?? "");
    if (!Number.isNaN(parseResult)) {
      return parseResult;
    }
  }, [invoice_id_param]);
  const isDetailsPageOpen: boolean = !!(
    selectedInvoiceId && selectedInvoiceId > 0
  );

  // states
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [, setIsEditModalOpen] = useState<boolean>(false);
  const [, setEditingItemId] = useState<number>();

  const loadInvoices = useCallback(() => {
    setIsLoading(true);
    invoiceService.getInvoices().then((invoices) => {
      setInvoices(invoices?.invoices ?? []);
      setIsLoading(false);
    });
  }, []);

  const handleInvoiceEditClick = useCallback((edit_item_id?: number) => {
    if (edit_item_id) {
      setEditingItemId(edit_item_id);
    } else {
      setEditingItemId(undefined);
    }
    setIsEditModalOpen((prev) => !prev);
  }, []);

  const handleInvoiceAddClick = useCallback(() => {
    navigate(AppURLPaths.APP_PAGE.INVOICES.INVOICE_CREATE(""));
  }, [navigate]);

  const handleInvoiceModificationSuccess = useCallback<OnInvoiceModification>(
    (action_type: string) => {
      if (action_type === "add") {
        toast({
          title: "Success",
          description: "Invoice is added successfully",
        });
      } else if (action_type === "edit") {
        toast({
          title: "Success",
          description: "Invoice is updated successfully",
        });
      } else if (action_type === "delete") {
        toast({
          title: "Success",
          description: "Invoice is delete successfully",
        });
      }
      loadInvoices();
    },
    [loadInvoices],
  );

  useEffect(() => {
    loadInvoices();
    return () => {
      invoiceService.abortGetRequest();
    };
  }, [loadInvoices]);


  const handleListRefresh = useCallback(() => {
    loadInvoices();
  }, [loadInvoices])

  const {
    entity_views: { default_filters },
    entity_select_columns,
  } = useAppSelector(selectCustomViewStateOfInvoice);

  const sortOptionsInDD = [
    {
      label: "Issue date",
      value: "issue_date",
      order: "asc",
    },
    {
      label: "Due date",
      value: "due_date",
      order: null,
    },
    {
      label: "Invoice number",
      value: "invoice_number",
      order: null,
    },
    {
      label: "Total",
      value: "total",
      order: null,
    },
    {
      label: "Balance",
      value: "balance",
      order: null,
    },
  ];


  return (
    <>
      <div className={"grid grid-cols-12"}>
        <div
            className={classNames(
                "col-span-12",
                isDetailsPageOpen && ` hidden lg:block lg:col-span-4`,
            )}
        >

          <section
              className={
                "flex px-5 py-3  justify-between items-center shrink-0 drop-shadow-sm bg-accent-muted"
              }
          >
            <div>
              <h1 className={"text-lg"}>Invoices</h1>
              <Select>
                <SelectTrigger
                    className="w-[100px] p-0 h-7 text-left focus:ring-0 bg-transparent border-0 focus:ring-offset-0">
                  <SelectValue placeholder="Select filter"/>
                </SelectTrigger>
                <SelectContent>
                  {default_filters.map((filter, index) => (
                      <SelectItem key={index} value={filter.value} showTick={false}>
                        {filter.title}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={"flex gap-x-2"}>
              <Button size={"sm"} onClick={handleInvoiceAddClick}>
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
                  {sortOptionsInDD.map((option, index) => (
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

          <InvoiceListing
              shrinkTable={isDetailsPageOpen}
              selectedInvoiceId={selectedInvoiceId}
              invoices={invoices}
              isFetching={isLoading}
              onInvoiceModificationSuccess={handleInvoiceModificationSuccess}
              onInvoiceEditClick={handleInvoiceEditClick}
          />
        </div>
        {isDetailsPageOpen && (
            <div className={"col-span-12 lg:col-span-8"}>
              <Outlet/>
            </div>
        )}
      </div>
    </>
  );
}
export type {
  OnInvoiceAddOrEditSuccess,
  OnInvoiceDeleteSuccess,
  OnInvoiceModification,
};
