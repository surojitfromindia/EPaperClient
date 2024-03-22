import {
  AutoNumber,
  AutoNumberGroupForSingleEntity,
} from "@/API/Resources/v1/AutoNumberSeries/AutoNumberSeries";
import { Currency } from "@/API/Resources/v1/Currency/Currency";

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
interface InvoiceDashboardData {
  due_today: number;
  due_within_30_days: number;
  total_overdue: number;
  due_today_formatted: string;
  due_within_30_days_formatted: string;
  total_overdue_formatted: string;
  total_outstanding: number;
  total_outstanding_formatted: string;
  currency_symbol: Currency["currency_symbol"];
}

export {
  InvoiceSettings,
  InvoiceAutoNumberSettingsUpdatePayload,
  InvoiceDashboardData,
};
