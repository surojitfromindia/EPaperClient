import { Button } from "@/components/ui/button.tsx";
import { useCallback, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BookMarked,
  ChevronLeft,
  ChevronRight,
  Gauge,
  LayoutDashboard,
  Receipt,
  ShoppingCart,
  UserCircle,
} from "lucide-react";
import classNames from "classnames";
import { cn } from "@/lib/utils.ts";
import {defaultInvoiceFilter} from "@/API/Resources/v1/util/invoiceFilter.ts";

export function Sidebar({ sideBarFloat }: { sideBarFloat: boolean }) {
  const { pathname } = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActiveLink = useCallback((is_active: boolean) => {
    if (is_active) {
      return "default";
    }
    return "ghost";
  }, []);

  const navOptions = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard className={"h-4 w-4 "} />,
      path: "/app/dashboard",
    },
    {
      label: "Item",
      icon: <ShoppingCart className={"h-4 w-4 "} />,
      path: "/app/inventory/items",
    },
    {
      label: "Customer",
      icon: <UserCircle className={"h-4 w-4 "} />,
      path: "/app/customers",
    },
    {
      label: "Invoice",
      icon: <Receipt className={"h-4 w-4 "} />,
      path: `/app/invoices?filter_by=${defaultInvoiceFilter}`,
    },
    {
      label: "Chart Of Accounts",
      icon: <BookMarked className={"h-4 w-4 "} />,
      path: "/app/chart_of_accounts",
    },
  ];

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
          cn(
            "transition-width col-span-1 flex-shrink-0 flex flex-col justify-between border-r-1 h-screen max-h-screen ",
            isCollapsed ? "w-[65px]" : "w-[200px]",
          ),
        )}
      >
        <div className="px-2 flex-shrink overflow-y-auto   py-2">
          <div className="space-y-1 font-light">
            {navOptions.map((navOption, index) => (
              <NavLink to={navOption.path} key={index}>
                {({ isActive }) => (
                  <Button
                    variant={isActiveLink(isActive)}
                    className="w-full justify-start"
                  >
                    {navOption.icon}
                    {!isCollapsed && (
                      <span className={"ml-2"}>{navOption.label}</span>
                    )}
                  </Button>
                )}
              </NavLink>
            ))}
          </div>
        </div>
        <div className={"h-10 mb-12  "}>
          <Button
            className={"rounded-none w-full bg-transparent"}
            variant={"ghost"}
            size={"icon"}
            onClick={() => {
              setIsCollapsed((prev: boolean) => !prev);
            }}
          >
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
        </div>
      </div>
    </div>
  );
}
