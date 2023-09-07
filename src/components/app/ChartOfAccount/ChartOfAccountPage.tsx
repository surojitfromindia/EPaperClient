import { ChartOfAccountListing } from "@/components/app/ChartOfAccount/ChartOfAccountListing.tsx";
import { useEffect, useState } from "react";
import ChartOfAccountService, {
  ChartOfAccount,
} from "@/API/Resources/v1/ChartOfAccount/ChartOfAccount.Service.ts";

export default function ChartOfAccountPage() {
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccount[]>([]);

  useEffect(() => {
    const chartOfAccountService = new ChartOfAccountService();
    chartOfAccountService.getChartOfAccounts().then((chartOfAccounts) => {
      setChartOfAccounts(chartOfAccounts?.accounts ?? []);
    });
    return () => {
      chartOfAccountService.abortGetRequest();
    };
  }, []);

  return (
    <>
      <ChartOfAccountListing accounts={chartOfAccounts} />
    </>
  );
}
