import {
    InvoiceCreationPayloadType,
    InvoiceLineItemCreationPayloadType
} from "@/API/Resources/v1/Invoice/InvoiceCreationPayloadTypes";

interface InvoiceUpdatePayloadType extends InvoiceCreationPayloadType {
    invoice_id?: number;
}
interface InvoiceLineItemUpdatePayloadType extends InvoiceLineItemCreationPayloadType {
    line_item_id?: number;
}
export { InvoiceUpdatePayloadType, InvoiceLineItemUpdatePayloadType };

