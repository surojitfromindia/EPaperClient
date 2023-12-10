type InvoiceCreationPayloadType = {
  issue_date: Date;
  due_date: Date;
  payment_term_id?: number;
  contact_id: number;
  invoice_number: string;
  is_inclusive_tax: boolean;
  line_items: InvoiceLineItemCreationPayloadType[];
  notes?: string;
  transaction_status: "draft" | "sent";
  exchange_rate?: number;
};
type InvoiceLineItemCreationPayloadType = {
  item_id: number;
    product_type: string;
  name: string;
  description?: string;
  unit?: string;
  unit_id?: number;
  account_id: number;
  tax_id?: number;
  rate: number;
  quantity: number;
  discount_percentage?: number;
  discount_amount?: number;
  tax_percentage?: number;
};
export { InvoiceCreationPayloadType, InvoiceLineItemCreationPayloadType };
