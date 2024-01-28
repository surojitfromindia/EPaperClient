import { CheckCircle, CircleDollarSign, LucideSettings } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Link } from "react-router-dom";
import React, { useEffect, useMemo } from "react";
import { AppStateOrganization } from "@/API/Resources/v1/AppState/AppState.ts";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet.tsx";
import { useAppSelector } from "@/redux/hooks.ts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar.tsx";
import {
  Organization,
  OrganizationsUser,
} from "@/API/Resources/v1/Organization/Organization";
import OrganizationService from "@/API/Resources/v1/Organization/Organization.Service.ts";
import { CheckCircledIcon } from "@radix-ui/react-icons";

const organizationService = new OrganizationService();

interface TopBarProps extends React.HTMLAttributes<HTMLDivElement> {
  isSideBarCollapsed?: boolean;
}

export default function TopBar() {
  const organization = useAppSelector(({ organization }) => organization);
  const [organizations, setOrganizations] = React.useState<OrganizationsUser[]>(
    [],
  );
  useEffect(() => {
    organizationService.getOrganizationsOfUser().then((response) => {
      setOrganizations(response.organizations);
    });
  }, [organization]);

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
              <CircleDollarSign className={"inline-flex mr-2"} />
              EPaper
            </Link>
          </span>
        </div>
      </div>
      <div className={"left_top_band mx-2 flex-grow"}></div>
      <div className={"flex items-center"}>
        <div className={"p-2 cursor-pointer"}>
          <Sheet>
            <SheetTrigger>{organization.name}</SheetTrigger>
            <SheetContent className={"p-0"}>
              <SheetHeader className={"p-3 border-b shadow-sm"}>
                <SheetTitle>My Organizations</SheetTitle>
              </SheetHeader>
              <OrganizationList organizationsUser={organizations} />
            </SheetContent>
          </Sheet>
        </div>
        <div className={"p-2  flex items-center space-x-3"}>
          <Button size={"icon"}>
            <LucideSettings className={"h-4"} />
          </Button>
          <Avatar className={"h-8 w-8"}>
            <AvatarFallback className={"text-primary"}>S</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}

function OrganizationList({
  organizationsUser,
}: {
  organizationsUser: OrganizationsUser[];
}) {
  const primaryOrganization = useAppSelector(({ organization }) => organization);

  return (
    <div className={"flex flex-col"}>
      {organizationsUser.map((organization) => (
        <React.Fragment key={organization.organization_id}>
          <Link
            to={`/app/organization/${organization.organization_id}`}
            className={
              "flex items-center space-x-2  rounded hover:bg-gray-100 p-3 border-b"
            }
          >
            <Avatar className={"h-8 w-8"}>
              <AvatarFallback className={"text-primary"}>
                {organization.organization.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className={"flex-grow"}>
              <div className={"font-semibold"}>
                {organization.organization.name}
              </div>
              <div className={"text-gray-500"}>
                {organization.organization.primary_address}
              </div>
            </div>
            {
              organization.organization_id === primaryOrganization.organization_id &&
              <CheckCircledIcon className={"h-5 w-5 text-primary"} />}
          </Link>
        </React.Fragment>
      ))}
    </div>
  );
}
