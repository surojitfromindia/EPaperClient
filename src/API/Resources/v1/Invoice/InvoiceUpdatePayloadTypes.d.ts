import {
    InvoiceCreationPayloadType,
    InvoiceLineItemCreationPayloadType
} from "@/API/Resources/v1/Invoice/InvoiceCreationPayloadTypes";

interface InvoiceUpdatePayloadType extends InvoiceCreationPayloadType {
    invoice_id?: number;
    line_items: InvoiceLineItemUpdatePayloadType[];
}
interface InvoiceLineItemUpdatePayloadType extends InvoiceLineItemCreationPayloadType {
    line_item_id?: number;
}
export { InvoiceUpdatePayloadType, InvoiceLineItemUpdatePayloadType };

