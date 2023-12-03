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
    .optional()
    .or(
      z.object({
        label: z.string().optional(),
        value: z.number().optional(),
      }),
    ),
  tax_percentage: z.number().optional(),
  discount_percentage: z.number().optional(),
});

const invoiceLineItemRowToPayloadDTO = (
  lineItem: LineItemRowType,
): InvoiceLineItemCreationPayloadType => {
  return {
    item_id: lineItem.item.value,
    name: lineItem.item.label,
    unit: lineItem.unit,
    unit_id: lineItem.unit_id,
    description: lineItem.description,
    quantity: lineItem.quantity,
    rate: lineItem.rate,
    discount_amount: lineItem.discount_amount,
    tax_id: lineItem.tax?.value,
    tax_percentage: lineItem.tax_percentage,
    discount_percentage: lineItem.discount_percentage,
    account_id: lineItem.account.value,
  };
};
export { invoiceLineItemSchema, invoiceLineItemRowToPayloadDTO };
