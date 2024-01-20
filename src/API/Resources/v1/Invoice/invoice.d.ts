import {AutoNumber, AutoNumberGroupForSingleEntity} from "@/API/Resources/v1/AutoNumberSeries/AutoNumberSeries";

interface InvoiceSettings {
  is_auto_number_enabled: boolean;
  default_auto_number_group: AutoNumberGroupForSingleEntity;
  auto_number_groups: AutoNumberGroupForSingleEntity[];
}

interface InvoiceAutoNumberSettingsUpdatePayload {
  is_auto_number_enabled: boolean;
  auto_number_group_id: AutoNumberGroupForSingleEntity["auto_number_group_id"];
  next_number: AutoNumber["next_number"];
  prefix_string: AutoNumber["prefix_string"];
}


export { InvoiceSettings, InvoiceAutoNumberSettingsUpdatePayload };
