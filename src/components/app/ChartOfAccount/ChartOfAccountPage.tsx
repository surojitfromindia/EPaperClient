import {ChartOfAccountListing} from "@/components/app/ChartOfAccount/ChartOfAccountListing.tsx";
import {useEffect, useState} from "react";
import ChartOfAccountService, {ChartOfAccount} from "@/API/Resources/v1/ChartOfAccount.Service.ts";


export default function ChartOfAccountPage() {
    const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccount[]>([])
    const fetchChartOfAccounts = (): void => {
        ChartOfAccountService.getChartOfAccounts().then((chartOfAccounts) => {
            setChartOfAccounts(chartOfAccounts?.accounts??[]);
        })
    }

    useEffect(() => {
        fetchChartOfAccounts()
    }, [])


    return (
        <>
            <ChartOfAccountListing accounts={chartOfAccounts}/>
        </>
    )
}
