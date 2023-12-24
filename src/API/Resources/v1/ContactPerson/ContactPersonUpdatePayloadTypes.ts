import {ContactPersonCreatePayload} from "@/API/Resources/v1/ContactPerson/ContactPersonCreate.Payload";

interface ContactPersonUpdatePayloadType extends ContactPersonCreatePayload {
    contact_person_id: number;
}
export type { ContactPersonUpdatePayloadType };