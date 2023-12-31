import { Edit, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ChartOfAccountService, {
  ChartOfAccount,
} from "@/API/Resources/v1/ChartOfAccount/ChartOfAccount.Service.ts";
import LoaderComponent from "@/components/app/common/LoaderComponent.tsx";
import { useAccountAddEditModal } from "@/components/app/ChartOfAccount/ChartOfAccountPage.tsx";
import { mergePathNameAndSearchParams } from "@/util/urlUtil.ts";

const chartOfAccountService = new ChartOfAccountService();

export default function ChartOfAccountDetails() {
  const { onAccountEditClick } = useAccountAddEditModal();
  const { account_id } = useParams();
  const { search } = useLocation();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const editingAccountId = useMemo(
    () => (account_id ? Number(account_id) : 0),
    [account_id],
  );
  const [accountDetails, setAccountDetails] = useState<ChartOfAccount>();

  useEffect(() => {
    if (editingAccountId) {
      setIsLoading(true);
      chartOfAccountService
        .getChartOfAccount({ account_id: editingAccountId })
        .then((data) => {
          if (data && data.chart_of_account) {
            setAccountDetails(data.chart_of_account);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [editingAccountId]);

  const handleEditButtonClick = (account_id: number) => {
    onAccountEditClick?.(account_id);
  };

  const handleCloseClick = () => {
    navigate(
      mergePathNameAndSearchParams({
        path_name: "/app/chart_of_accounts",
        search_params: search,
      }),
    );
  };
  if (isLoading) {
    return (
      <div className={"relative h-screen"}>
        <LoaderComponent />
      </div>
    );
  }

  return (
    <div className={"w-full h-full"}>
      <section>
        <div className={"p-3 flex items-center justify-between"}>
          <div className={"flex flex-col"}>
            <span className={"text-xs text-muted-foreground"}>
              {accountDetails?.account_type_name_formatted}
            </span>
            <span>{accountDetails?.account_name}</span>
          </div>
          <div>
            <span className={"text-xs inline-flex"}>
              <Button variant={"ghost"}>
                <Paperclip className={"w-4 h-4"} />
                Attachments
              </Button>
              <Button variant={"ghost"} onClick={handleCloseClick}>
                <X className={"w-4 h-4"} />
              </Button>
            </span>
          </div>
        </div>
      </section>
      <section className={"w-full bg-accent"}>
        <div className={"flex"}>
          <Button
            className={"rounded-none"}
            variant={"ghost_primary"}
            onClick={() => handleEditButtonClick(editingAccountId)}
          >
            <Edit className={"w-4 h-4"} />
            Configure
          </Button>
        </div>
      </section>
    </div>
  );
}
