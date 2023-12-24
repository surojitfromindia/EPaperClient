import * as z from "zod";
import { LineItemRowType } from "@/components/app/common/LineItemInputTable.tsx";
import { InvoiceLineItemCreationPayloadType } from "@/API/Resources/v1/Invoice/InvoiceCreationPayloadTypes";

const invoiceLineItemSchema = z.object({
  item: z.object(
    {
      label: z.string(),
      value: z.number().optional(),
    },
    {
      invalid_type_error: "Please select an item",
      required_error: "Please select an item",
    },
  ),
  product_type: z.string({
    required_error: "item does not have a product type",
  }),
  account: z.object(
    {
      label: z.string(),
      value: z.number(),
    },
    {
      invalid_type_error: "Please select an item account",
      required_error: "Please select an item account",
    },
  ),
  unit: z.string().optional(),
  unit_id: z.number().optional(),
  description: z.string().optional(),
  quantity: z.number(),
  rate: z.number(),
  discount_amount: z.number().optional(),
  tax: z
    .string()
    .nullable()
    .or(
      z.object({
        label: z.string().optional(),
        value: z.number().optional(),
      }),
    ),
  tax_percentage: z.number().optional(),
  discount_percentage: z.number().optional(),
});

type InvoiceLineItemCreatableFields = {
  item?: {
    value?: number;
    label?: string;
  };
  product_type?: string;
  account?: {
    value?: number;
  };
  unit?: string;
  unit_id?: number;
  description?: string;
  quantity?: number;
  rate?: number;
  discount_amount?: number;
  tax?: {
    value?: number;
  } | string;
  tax_percentage?: number;
  discount_percentage?: number;
};

const invoiceLineItemRowToPayloadDTO = (
  lineItem: InvoiceLineItemCreatableFields,
): InvoiceLineItemCreationPayloadType => {
  return {
    item_id: lineItem.item.value,
    product_type: lineItem.product_type,
    name: lineItem.item.label,
    unit: lineItem.unit,
    unit_id: lineItem.unit_id,
    description: lineItem.description,
    quantity: lineItem.quantity,
    rate: lineItem.rate,
    discount_amount: lineItem.discount_amount,
    tax_id: typeof lineItem.tax !== "string" ? lineItem.tax?.value : null,
    tax_percentage: lineItem.tax_percentage,
    discount_percentage: lineItem.discount_percentage,
    account_id: lineItem.account.value,
  };
};
export { invoiceLineItemSchema, invoiceLineItemRowToPayloadDTO };
