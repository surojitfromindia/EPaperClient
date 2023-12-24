//-------------------validation schema-------------------
import * as z from "zod";

const contactPersonSchema = z.object({
  salutation: z.string().trim().optional(),
  first_name: z.string().trim().optional(),
  last_name: z.string().trim().optional(),
  email: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  mobile: z.string().trim().optional(),
  is_primary: z.boolean().optional(),
});
const basicSchema = z.object({
  contact_name: z
    .string({
      invalid_type_error: "enter contact name",
      required_error: "enter contact name",
    })
    .trim()
    .nonempty({ message: "enter contact name" }),
  contact_type: z.enum(["customer", "vendor"]),
  company_name: z.string().trim().optional(),
  currency: z.object(
    { value: z.number(), label: z.string() },
    {
      invalid_type_error: "select a currency",
      required_error: "select a currency",
    },
  ),
  payment_term: z
    .object(
      { value: z.number(), label: z.string() },
      {
        invalid_type_error: "select a payment term",
        required_error: "select a payment term",
      },
    )
    .optional(),
  tax: z
    .object(
      { value: z.number(), label: z.string() },
      {
        invalid_type_error: "select a tax",
        required_error: "select a tax",
      },
    )
    .optional(),
  remarks: z.string().trim().optional(),

  // treat these as first contact person
  salutation: contactPersonSchema.shape.salutation,
  first_name: contactPersonSchema.shape.first_name,
  last_name: contactPersonSchema.shape.last_name,
  email: contactPersonSchema.shape.email,
  phone: contactPersonSchema.shape.phone,
  mobile: contactPersonSchema.shape.mobile,
  contact_persons: z.array(contactPersonSchema).optional(),
});
const customerSchema = z.object({
  contact_type: z.literal("customer"),
  contact_sub_type: z.enum(["business", "individual"]),
});
const vendorSchema = z.object({
  contact_type: z.literal("vendor"),
});
const contactSchema = basicSchema.and(
  z.discriminatedUnion("contact_type", [customerSchema, vendorSchema]),
);
export {
    contactSchema,
    contactPersonSchema
}