import { Paperclip, X, Edit, HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import * as React from "react";
import { useParams } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import InvoiceService, {
  Invoice,
} from "@/API/Resources/v1/Invoice/Invoice.Service.ts";
import LoaderComponent from "@/components/app/common/LoaderComponent.tsx";

const invoiceService = new InvoiceService();

const InvoiceDetails = () => {
  const { invoice_id_param } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [invoiceDetails, setInvoiceDetails] = useState<Invoice | null>(null);
  const editInvoiceId = useMemo(() => {
    //try to parse the number, check the return if NaN then return nothing from this memo
    const parseResult = Number.parseInt(invoice_id_param ?? "");
    if (!Number.isNaN(parseResult)) {
      return parseResult;
    }
  }, [invoice_id_param]);

  const loadInvoice = useCallback(() => {
    setIsLoading(true);
    invoiceService
      .getInvoice({ invoice_id: editInvoiceId })
      .then((data) => {
        setInvoiceDetails(data.invoice);
      })
      .finally(() => setIsLoading(false));
  }, [editInvoiceId]);

  // effects
  useEffect(() => {
    loadInvoice();
    return () => {
      invoiceService.abortGetRequest();
    };
  }, [loadInvoice]);

  if (isLoading) {
    return (
      <div className={"relative h-screen"}>
        <LoaderComponent />
      </div>
    );
  }

  return (
    <div>
      <DetailsHeader
        transaction_number={invoiceDetails.invoice_number}
        onClose={() => {}}
      />
      <ul className={"flex list-none pl-0 border-b-1 bg-accent-muted "}>
        <li className={"border-r-1 cursor-pointer"}>
          <Button variant={"ghost"} className={"hover_blue"}>
            <Edit className={"w-4 h-4 mr-1"} />
            Edit
          </Button>
        </li>
        <li className={"border-r-1 cursor-pointer"}>
          <Button variant={"ghost"} className={"hover_blue"}>
            <HandCoins className={"w-4 h-4 mr-1"} />
            Record Payment
          </Button>
        </li>
        <li></li>
      </ul>
    </div>
  );
};
export default InvoiceDetails;

const DetailsHeader = ({ transaction_number, onClose }) => {
  return (
    <div>
      <div className={"flex justify-between items-center h-16 px-5 border-b-1"}>
        {/*transaction number*/}
        <div className={"flex flex-col"}>
          <span className={"text-sm text-muted-foreground"}>
            Branch : Head office
          </span>
          <span className={"font-medium text-lg"}>{transaction_number}</span>
        </div>
        {/*Other actions*/}
        <div className={"flex gap-x-2 text-sm items-center"}>
          <span className={"inline-flex"}>
            <Paperclip size={14} className={"mt-0.5 text-primary"} />
            <span className={"ml-1"}>Attachments</span>
          </span>
          <span>
            <Button variant={"ghost"} onClick={onClose}>
              <X className={"w-4 h-4"} />
            </Button>
          </span>
        </div>
      </div>
    </div>
  );
};
