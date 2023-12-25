import { ContactCreatePayload } from "@/API/Resources/v1/Contact/ContactCreate.Payload";
import { ContactPersonCreatePayload } from "@/API/Resources/v1/ContactPerson/ContactPersonCreate.Payload";
import { ContactPersonUpdatePayloadType } from "@/API/Resources/v1/ContactPerson/ContactPersonUpdatePayloadTypes.ts";

type ContactUpdatePayload = ContactCreatePayload & {
  contact_id?: number;
  contact_persons?: (
    | ContactPersonCreatePayload
    | ContactPersonUpdatePayloadType
  )[];
};

export type { ContactUpdatePayload };