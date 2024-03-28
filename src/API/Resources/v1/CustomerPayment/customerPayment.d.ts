import {AutoNumberGroupForSingleEntity} from "@/API/Resources/v1/AutoNumberSeries/AutoNumberSeries";

interface CustomerPaymentSettings {
    is_auto_number_enabled: boolean;
    default_auto_number_group: AutoNumberGroupForSingleEntity;
    auto_number_groups: AutoNumberGroupForSingleEntity[];
}

export type {CustomerPaymentSettings};