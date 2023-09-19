import { Edit, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import { useParams } from "react-router-dom";
import ChartOfAccountAdd from "@/components/app/ChartOfAccount/Modals/ChartOfAccountAdd.Modal.tsx";
import { toast } from "@/components/ui/use-toast.ts";
import { OnAccountAddSuccess } from "@/components/app/ChartOfAccount/ChartOfAccountListing.tsx";
import ChartOfAccountService from "@/API/Resources/v1/ChartOfAccount/ChartOfAccount.Service.ts";

interface ChartOfAccountDetailsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  onEditClick?: (account_id: number) => void;
}
const chartOfAccountService = new ChartOfAccountService();

export default function ChartOfAccountDetails(po: ChartOfAccountDetailsProps) {
  const { account_id } = useParams();
  const editingAccountId = useMemo(
    () => (account_id ? Number(account_id) : 0),
    [account_id],
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if(editingAccountId){
       chartOfAccountService.getChartOfAccount({account_id:editingAccountId})
    }
  }, [editingAccountId]);


  const handleEditModalOpenCloseAction = (action: boolean) => {
    setIsEditModalOpen(action);
  };

  const onActionSuccess = useCallback<OnAccountAddSuccess>((action_type) => {
    if (action_type === "add") {
      toast({
        title: "Success",
        description: "Account is added successfully",
      });
    } else if (action_type === "edit") {
      toast({
        title: "Success",
        description: "Account is updated successfully",
      });
    }
  }, []);
  return (
    <div className={"w-full h-full"}>
      <section>
        <div className={"p-3 flex items-center justify-between"}>
          <div className={"flex flex-col"}>
            <span className={"text-xs text-muted-foreground"}>
              Account Type
            </span>
            <span>Account Name</span>
          </div>
          <div>
            <span className={"text-xs inline-flex"}>
              <Button variant={"ghost"}>
                <Paperclip className={"w-4 h-4"} />
                Attachments
              </Button>
              <Button variant={"ghost"}>
                <X className={"w-4 h-4"} />
              </Button>
            </span>
          </div>
        </div>
      </section>
      <section className={"w-full bg-accent"}>
        <div className={"flex"}>
          <Button
            className={"rounded-none text-primary"}
            variant={"ghost_primary"}
            onClick={() => handleEditModalOpenCloseAction(true)}
          >
            <Edit className={"w-4 h-4"} />
            Configure
          </Button>
        </div>
      </section>
      {
        <ChartOfAccountAdd
          isOpen={isEditModalOpen}
          onClose={() => handleEditModalOpenCloseAction(false)}
          editAccountId={editingAccountId}
          onActionSuccess={onActionSuccess}
        />
      }
    </div>
  );
}
