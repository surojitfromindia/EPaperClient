import {
  ArrowDownLeft,
  CircleArrowLeft,
  Dot,
  MoveDownLeft,
  RefreshCcw,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { InvoiceDashboardData } from "@/API/Resources/v1/Invoice/invoice";
import { cn } from "@/lib/utils.ts";

function InvoiceDashBoard({
  invoiceDashboardData,
  isLoading,
  onRefresh,
}: {
  invoiceDashboardData: InvoiceDashboardData;
  isLoading: boolean;
  onRefresh: () => void;
}) {
  const {
    currency_symbol,
    due_today_formatted,
    due_within_30_days_formatted,
    total_overdue_formatted,
      total_outstanding_formatted
  } = invoiceDashboardData;
  return (
    <section className={"min-w-full overflow-y-scroll p-6 bg-accent-muted rounded"}>
      <div className={"mb-4"}>
        <div className={"text-sm text-muted-foreground mr-4 inline-flex"}>
          Payment summary
          <span className={"mt-1 visible"} onClick={onRefresh}>
            <RefreshCw
              role={"button"}
              className={cn("ml-2 h-4 w-4", isLoading ? "animate-spin" : "")}
            />
          </span>
        </div>
      </div>
      <div className={"flex gap-x-5 items-center"}>
        <div className={"flex shrink-0"}>
          <span
            className={
              "w-10 h-10 rounded-full bg-amber-500/80 flex items-center justify-center"
            }
          >
            <ArrowDownLeft className={"text-amber-800"} />
          </span>
          <div className={"ml-2"}>
            <span className={"text-muted-foreground"}>
              Total Outstanding Receivables
            </span>
            <div className={"mt-1"}>
              <span className={"font-semibold"}>
                    {total_outstanding_formatted}
              </span>
            </div>
          </div>
        </div>
        <div className={"px-2 ml-5"}>
          <span className={"text-muted-foreground"}>Due today</span>
          <div className={"mt-1"}>
            <span className={"text-amber-600"}>{due_today_formatted}</span>
          </div>
        </div>
        <Dot className={"text-muted-foreground/40"} />
        <div className={"px-2"}>
          <span className={"text-muted-foreground"}>Due Within 30 Days</span>
          <div className={"mt-1"}>
            <span className={""}>{due_within_30_days_formatted}</span>
          </div>
        </div>
        <Dot className={"text-muted-foreground/40"} />
        <div className={"px-2"}>
          <span className={"text-muted-foreground"}>Overdue Invoice</span>
          <div className={"mt-1"}>
            <span className={""}>{total_overdue_formatted}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
export default InvoiceDashBoard;
