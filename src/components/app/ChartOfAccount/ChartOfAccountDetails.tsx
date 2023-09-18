import {Paperclip} from "lucide-react";

export default function  ChartOfAccountDetails(){
    return(
        <div className={"w-full h-full"}>
            <section>
                <div className={"p-3 flex items-center justify-between"}>
                    <div className={"flex flex-col"}>
                        <span className={"text-xs text-muted-foreground"}>Account Type</span>
                        <span>Account Name</span>
                    </div>
                    <div>
                        <span className={"text-xs inline-flex"}>
                            <Paperclip className={"w-4 h-4"}/>
                            <span>Attachments</span>
                        </span>
                    </div>
                </div>
            </section>


        </div>

    )
}