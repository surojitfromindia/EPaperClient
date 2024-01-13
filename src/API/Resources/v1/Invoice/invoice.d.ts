import {AutoNumberGroup, AutoNumberGroupForSingleEntity} from "@/API/Resources/v1/AutoNumberSeries/AutoNumberSeries";

interface InvoiceSettings {
  is_auto_number_enabled: boolean;
  default_auto_number_group: AutoNumberGroupForSingleEntity;
  auto_number_groups: AutoNumberGroup[];
}
export { InvoiceSettings };
