import { ChartOfAccountListing } from "@/components/app/ChartOfAccount/ChartOfAccountListing.tsx";
import { Outlet, useParams } from "react-router-dom";

export default function ChartOfAccountPage() {
  const { account_id } = useParams();
  const isDetailsPageOpen: boolean = account_id ? true : false;

  return (
    <>
      <div className={"grid grid-cols-3"}>
        <div className={isDetailsPageOpen ? `col-span-1` : "col-span-3"}>
          <ChartOfAccountListing shrinkTable={isDetailsPageOpen} />
        </div>
        {isDetailsPageOpen && (
          <div className={"col-span-2"}>
            <Outlet />
          </div>
        )}
      </div>
    </>
  );
}
