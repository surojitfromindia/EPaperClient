import * as z from "zod";

const lineItemSchema = z.object({
    item: z.object({
        label: z.string(),
        value: z.number(),
    }),
    unit: z.string().optional(),
    description: z.string().optional(),
    quantity: z.number(),
    price: z.number(),
    discount_amount: z.number(),
    tax: z
        .object({
            label: z.string().optional(),
            value: z.number().optional(),
        })
        .nullable(),
    tax_percentage: z.number().optional(),
    discount_percentage: z.number().optional(),
    total: z.number(),
});
export {lineItemSchema};