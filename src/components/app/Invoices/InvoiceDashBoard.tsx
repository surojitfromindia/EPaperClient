import {
  ArrowDownLeft,
  CircleArrowLeft,
  Dot,
  MoveDownLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";

function InvoiceDashBoard({ currencySymbol }) {
  return (
    <section className={"w-full px-5 py-6 bg-accent-muted rounded"}>
      <div className={"mb-4"}>
        <span className={"text-sm text-muted-foreground mr-4"}>
          Payment summary
        </span>
        <Badge variant="default">Coming soon..</Badge>
      </div>
      <div className={"flex gap-x-5 items-center"}>
        <div className={"flex"}>
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
              <span className={"font-semibold"}>{currencySymbol} 0.00</span>
            </div>
          </div>
        </div>
        <div className={"px-2 ml-5"}>
          <span className={"text-muted-foreground"}>Total Paid</span>
          <div className={"mt-1"}>
            <span className={"text-amber-600"}>{currencySymbol} 0.00</span>
          </div>
        </div>
        <Dot className={"text-muted-foreground/40"} />
        <div className={"px-2"}>
          <span className={"text-muted-foreground"}>Due Within 30 Days</span>
          <div className={"mt-1"}>
            <span className={""}>{currencySymbol} 0.00</span>
          </div>
        </div>
        <Dot className={"text-muted-foreground/40"} />
        <div className={"px-2"}>
          <span className={"text-muted-foreground"}>Overdue Invoice</span>
          <div className={"mt-1"}>
            <span className={""}>{currencySymbol} 0.00</span>
          </div>
        </div>
      </div>
    </section>
  );
}
export default InvoiceDashBoard;
