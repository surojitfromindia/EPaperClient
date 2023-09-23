import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import {CircleDollarSign, LucideSettings} from "lucide-react";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Link } from "react-router-dom";
import * as React from "react";
import {AppStateOrganization} from "@/API/Resources/v1/AppState/AppState.ts";
import {useMemo} from "react";


interface TopBarProps extends React.HTMLAttributes<HTMLDivElement> {
  organization?: AppStateOrganization,
  isSideBarCollapsed?:boolean
}

export default function TopBar({organization}:TopBarProps) {
  const organizationName:string = useMemo(()=> organization?.name ?? "<No Name>",[organization])
  const organizationAddress:string = useMemo(()=> organization?.primary_address ?? "<No Address>",[organization])
  return (
    <div
      className={
        "h-12 bg-primary flex items-center w-full shrink-0 text-primary-foreground"
      }
    >
      <div className={"logo_container h-12 w-[200px] -m-1 overflow-hidden "}>
        <div className={"logo-collapse flex items-center"}>
          <span className={"mt-3 mb-3 ml-4 h-6"}>
            <Link to={"/app/dashboard"}>
              <CircleDollarSign className={"inline-flex mr-2"}/>
              EPaper
            </Link>
          </span>
        </div>
      </div>
      <div className={"left_top_band mx-2 flex-grow"}></div>
      <div className={"flex items-center"}>
        <div className={"p-2 cursor-pointer"}>
          <Popover>
            <PopoverTrigger asChild>
              <span
                className={
                  "text-xs mx-2 max-w-[90px] block overflow-hidden whitespace-nowrap overflow-ellipsis"
                }
              >
                {organizationName}
              </span>
            </PopoverTrigger>
            <PopoverContent
              className={"p-2 bg-primary mt-1 border-0 rounded-0.5 rounded-r-none text-primary-foreground"}
            >
              <div className={"flex flex-col space-y-2"}>
                <span className={"text-md"}>{organizationName}</span>
                <span className={"text-xs"}>{organizationAddress}</span>
              </div>

            </PopoverContent>
          </Popover>
        </div>
        <div className={"p-2  flex items-center space-x-3"}>
          <Button size={"icon"}>
            <LucideSettings className={"h-4"} />
          </Button>
          {/*<Avatar className={"h-8 w-8"}>*/}
          {/*  <AvatarFallback className={"text-primary"}>S</AvatarFallback>*/}
          {/*</Avatar>*/}
        </div>
      </div>
    </div>
  );
}
