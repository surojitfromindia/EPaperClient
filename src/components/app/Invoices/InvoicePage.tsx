import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast.ts";
import classNames from "classnames";
import InvoiceService, {
  DEFAULT_GET_INVOICES_PARAMS,
  Invoice,
} from "@/API/Resources/v1/Invoice/Invoice.Service.ts";
import { InvoiceListing } from "@/components/app/Invoices/InvoiceListing.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Button } from "@/components/ui/button.tsx";
import { MoreVertical, Plus, RefreshCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { useAppSelector } from "@/redux/hooks.ts";
import { selectCustomViewStateOfInvoice } from "@/redux/features/customView/customViewSlice.ts";
import { AppURLPaths } from "@/constants/AppURLPaths.Constants.ts";
import { InvoicePageContext } from "@/API/Resources/v1/util/pageContext.ts";
import {
  defaultInvoiceFilter,
  InvoiceAppliedFilter,
} from "@/API/Resources/v1/util/invoiceFilter.ts";
import {
  mergePathNameAndSearchParams,
  updateOrAddSearchParam,
} from "@/util/urlUtil.ts";
import PaginationSelector from "@/components/app/common/PaginationSelector.tsx";
import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
} from "@/constants/Pagination.Constants.ts";

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
  const { search } = useLocation();
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
  const [pageContext, setPageContext] = useState<InvoicePageContext>({
    filter_by: defaultInvoiceFilter,
    page: DEFAULT_PAGE_NUMBER,
    per_page: DEFAULT_PAGE_SIZE,
    sort_column: "issue_date",
    sort_order: "A",
    has_more_page: false,
  });
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [, setIsEditModalOpen] = useState<boolean>(false);
  const [, setEditingItemId] = useState<number>();
  const [appliedFilter, setAppliedFilter] =
    useState<InvoiceAppliedFilter>(defaultInvoiceFilter);

  const loadInvoices = useCallback((search_query_string: string) => {
    const query = new URLSearchParams(search_query_string);
    const appliedFilter = query.get("filter_by") ?? defaultInvoiceFilter;
    const page = query.get("page")
      ? Number(query.get("page"))
      : DEFAULT_PAGE_NUMBER;
    const per_page = query.get("per_page")
      ? Number(query.get("per_page"))
      : DEFAULT_PAGE_SIZE;

    setIsLoading(true);
    invoiceService
      .getInvoices(
        {
          filter_by: appliedFilter,
        },
        {
          ...DEFAULT_GET_INVOICES_PARAMS.options,
          page,
          per_page,
        },
      )
      .then((data) => {
        setInvoices(data?.invoices ?? []);
        setPageContext(data?.page_context);
        setAppliedFilter(data?.page_context.filter_by);
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
      loadInvoices(search);
    },
    [loadInvoices, search],
  );

  useEffect(() => {
    loadInvoices(search);
    return () => {
      invoiceService.abortGetRequest();
    };
  }, [loadInvoices, search]);

  const handleListRefresh = useCallback(() => {
    loadInvoices(search);
  }, [search, loadInvoices]);

  const {
    entity_views: { default_filters },
  } = useAppSelector(selectCustomViewStateOfInvoice);

  const sortOptions = [
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

  const handleAppliedFilterChange = (value: InvoiceAppliedFilter) => {
    navigate(
      mergePathNameAndSearchParams({
        path_name: AppURLPaths.APP_PAGE.INVOICES.INDEX,
        search_params: updateOrAddSearchParam({
          search_string: search,
          key: "filter_by",
          value: value,
        }),
      }),
    );
  };

  const handlePageChange = (page: number) => {
    console.log(page, "page");
    navigate(
      mergePathNameAndSearchParams({
        path_name: AppURLPaths.APP_PAGE.INVOICES.INDEX,
        search_params: updateOrAddSearchParam({
          search_string: search,
          key: "page",
          value: page.toString(),
        }),
      }),
    );
  };

  return (
    <>
      <div className={"w-full h-full"}>
        <div
          className={classNames(
            "flex flex-col h-full overflow-y-auto relative shrink-0",
            !isDetailsPageOpen && "w-full",
            isDetailsPageOpen && `w-[400px]`,
          )}
        >
          <section
            className={
              "flex px-5 py-3  justify-between items-center drop-shadow-sm bg-accent-muted"
            }
          >
            <div>
              <h1 className={"text-lg"}>Invoices</h1>
              <Select
                value={appliedFilter}
                onValueChange={handleAppliedFilterChange}
              >
                <SelectTrigger className="w-[100px] p-0 h-7 text-left focus:ring-0 bg-transparent border-0 focus:ring-offset-0">
                  <SelectValue placeholder="Select filter" />
                </SelectTrigger>
                <SelectContent>
                  {default_filters.map((filter, index) => (
                    <SelectItem
                      key={index}
                      value={filter.value}
                      showTick={false}
                    >
                      {filter.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={"flex gap-x-2"}>
              <Button size={"sm"} onClick={handleInvoiceAddClick}>
                <Plus className="h-4 w-4" /> New
              </Button>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button size={"sm"} variant={"outline"} className={"shadow"}>
                    <MoreVertical className="h-4 w-4" />
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
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup className={"bg-green-50"}>
                    <DropdownMenuItem
                      role={"button"}
                      className={"menu-item-ok text-green-700"}
                      onClick={handleListRefresh}
                    >
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      <span>Refresh</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </section>
          <div className={"overflow-y-auto flex-grow"}>
            <InvoiceListing
              shrinkTable={isDetailsPageOpen}
              selectedInvoiceId={selectedInvoiceId}
              invoices={invoices}
              isFetching={isLoading}
              onInvoiceModificationSuccess={handleInvoiceModificationSuccess}
              onInvoiceEditClick={handleInvoiceEditClick}
            />
            <div className={"flex justify-end px-5 mb-20 mt-5"}>
              <PaginationSelector
                currentPage={pageContext.page}
                perPage={pageContext.per_page}
                hasMore={pageContext.has_more_page}
                currentRecords={invoices.length}
                onPageChange={handlePageChange}
                onPerPageChange={() => {}}
              />
            </div>
          </div>
        </div>

        {isDetailsPageOpen && (
          <div className={"flex-grow"}>
            <Outlet />
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
