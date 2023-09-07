import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button.tsx";
import React, { useCallback } from "react";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const { pathname } = useLocation();
  const isActiveLink = useCallback(
    (linkName: string) => {
      const lastEnd = pathname.split("/").pop();
      if (lastEnd === linkName) {
        return "default";
      }
      return "ghost";
    },
    [pathname],
  );
  return (
    <div className={cn("pb-12 bg-zinc-50 min-h-screen", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Button
              asChild
              variant={isActiveLink("dashboard")}
              className="w-full justify-start"
            >
              <Link to={"/app/dashboard"}>Dashboard</Link>
            </Button>
            <Button
              asChild
              variant={isActiveLink("items")}
              className="w-full justify-start"
            >
              <Link to={"/app/items"}>Items</Link>
            </Button>
            <Button
              asChild
              variant={isActiveLink("chart_of_accounts")}
              className="w-full justify-start"
            >
              <Link to={"/app/chart_of_accounts"}>Chart Of Accounts</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
