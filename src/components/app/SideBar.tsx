import { Button } from "@/components/ui/button.tsx";
import { useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { BookMarked, ChevronLeft, Gauge, ShoppingCart } from "lucide-react";

export function Sidebar() {
  const { pathname } = useLocation();

  const isActiveLink = useCallback(
    (is_active: boolean) => {
      if (is_active) {
        return "default";
      }
      return "ghost";
    },
    [pathname],
  );
  return (
    <div
      className={
        "col-span-1 flex-shrink-0 w-[220px]  h-screen max-h-screen flex flex-col justify-between border-r-[1.5px]"
      }
    >
      <div className="px-2 flex-shrink overflow-y-auto   py-2">
        <div className="space-y-1 font-light">
          <NavLink to={"/app/dashboard"}>
            {({ isActive }) => (
              <Button
                variant={isActiveLink(isActive)}
                className="w-full justify-start"
              >
                <Gauge className={"h-4 w-4 mr-2"} />
                Dashboard
              </Button>
            )}
          </NavLink>

          <NavLink to={"/app/inventory/items"}>
            {({ isActive }) => (
              <Button
                variant={isActiveLink(isActive)}
                className="w-full  justify-start"
              >
                <ShoppingCart className={"h-4 w-4 mr-2"} />
                Item
              </Button>
            )}
          </NavLink>

          <NavLink to={"/app/chart_of_accounts"}>
            {({ isActive }) => (
              <Button
                variant={isActiveLink(isActive)}
                className="w-full justify-start"
              >
                <BookMarked className={"h-4 w-4 mr-2"} />
                Chart Of Accounts
              </Button>
            )}
          </NavLink>
        </div>
      </div>
      <div className={"h-10 mb-12  "}>
        <Button
          className={"rounded-none w-full bg-transparent"}
          variant={"ghost_primary"}
          size={"icon"}
        >
          <ChevronLeft />
        </Button>
      </div>
    </div>
  );
}
