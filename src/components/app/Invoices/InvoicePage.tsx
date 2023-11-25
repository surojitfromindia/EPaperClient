import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast.ts";
import classNames from "classnames";
import InvoiceService, {Invoice} from "@/API/Resources/v1/Invoice/Invoice.Service.ts";
import {InvoiceListing} from "@/components/app/Invoices/InvoiceListing.tsx";
type OnInvoiceDeleteSuccess = (action_type: "delete", invoice_ids: number[]) => void;
type OnInvoiceAddOrEditSuccess = (
  action_type: "add" | "edit",
  invoice_id: number,
) => void;
type OnInvoiceModification = OnInvoiceAddOrEditSuccess & OnInvoiceDeleteSuccess;

const invoiceService = new InvoiceService();

export default function InvoicePage() {
  const navigate = useNavigate();
  const { invoice_id } = useParams();
  const selectedInvoiceId = useMemo(() => {
    const parseResult = Number.parseInt(invoice_id ?? "");
    if (!Number.isNaN(parseResult)) {
      return parseResult;
    }
  }, [invoice_id]);
  const isDetailsPageOpen: boolean = !!(
    selectedInvoiceId && selectedInvoiceId > 0
  );

  // states
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [, setIsEditModalOpen] = useState<boolean>(false);
  const [, setEditingItemId] = useState<number>();

  const loadInvoices = useCallback(() => {
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
    navigate("/app/invoices/new");
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

  return (
    <>
      <div className={"grid grid-cols-8"}>
        <div
          className={classNames(
            "col-span-8",
            isDetailsPageOpen && ` hidden lg:block lg:col-span-3`,
          )}
        >
          <InvoiceListing
              shrinkTable={isDetailsPageOpen}
              selectedInvoiceId={selectedInvoiceId}
              invoices={invoices}
              isFetching={isLoading}
              onInvoiceModificationSuccess={handleInvoiceModificationSuccess}
              onInvoiceEditClick={handleInvoiceEditClick}
              onInvoiceAddClick={handleInvoiceAddClick}
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
export type {
    OnInvoiceAddOrEditSuccess,
    OnInvoiceDeleteSuccess,
    OnInvoiceModification,
}