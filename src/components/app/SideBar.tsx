import { Button } from "@/components/ui/button.tsx";
import { useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BookMarked,
  ChevronLeft,
  Gauge,
  Receipt,
  ShoppingCart,
} from "lucide-react";
import classNames from "classnames";

export function Sidebar({ sideBarFloat }: { sideBarFloat: boolean }) {
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
      className={classNames(
        sideBarFloat
          ? "absolute bg-background z-40 sm:flex sm:static"
          : "hidden sm:block",
      )}
    >
      <div
        className={classNames(
          "col-span-1 flex-shrink-0 w-[220px] flex flex-col justify-between border-r-1 h-screen max-h-screen ",
        )}
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

            <NavLink to={"/app/invoices"}>
              {({ isActive }) => (
                <Button
                  variant={isActiveLink(isActive)}
                  className="w-full  justify-start"
                >
                  <Receipt className={"h-4 w-4 mr-2"} />
                  Invoice
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
    </div>
  );
}
