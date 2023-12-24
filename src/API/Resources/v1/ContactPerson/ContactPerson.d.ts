interface ContactPersonGenerated {
    contact_person_id: number;
    status: "active" | "deleted";
}
interface ContactPerson extends ContactPersonGenerated {
    salutation: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    mobile: string;
    is_primary: boolean;
}
export type { ContactPerson };