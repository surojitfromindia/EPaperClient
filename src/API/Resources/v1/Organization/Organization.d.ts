import {Currency} from "@/API/Resources/v1/Currency/Currency";

interface Organization {
    country_code: string;
    created_by_id: number;
    currency_code: string;
    currency_id: Currency["currency_id"];
    currency_name: Currency["currency_name"];
    currency_symbol: Currency["currency_symbol"];
    name: string;
    organization_id: number;
    primary_address: string;
    sector: string;
}

interface OrganizationsUser {
    role_id: number;
    status: string;
    user_id: number;
    organization_id: number;
    job_status: string;
    organization: Organization;
}
export type { Organization, OrganizationsUser };