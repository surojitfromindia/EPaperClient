import { Button } from "@/components/ui/button.tsx";
import  { useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BookMarked,
  ChevronLeft,
  Gauge,
  ShoppingCart,
} from "lucide-react";


export function Sidebar() {
  const { pathname } = useLocation();

  const isActiveLink = useCallback(
    (linkName: string) => {
      const lastEnd = pathname.split("/")[2];
      if (lastEnd === linkName) {
        return "default";
      }
      return "ghost";
    },
    [pathname],
  );
  return (
    <div
      className={
        "bg-accent h-screen max-h-screen flex flex-col justify-between border-r-[1px]"
      }
    >
      <div className="px-2 flex-shrink overflow-y-auto   py-2">
        <div className="space-y-1 font-light">
          <Link to={"/app/dashboard"}>
            <Button
              variant={isActiveLink("dashboard")}
              className="w-full justify-start"
            >
              <Gauge className={"h-4 w-4 mr-2"} />
              Dashboard
            </Button>
          </Link>

          <Link to={"/app/items"}>
            <Button
              variant={isActiveLink("items")}
              className="w-full  justify-start"
            >
              <ShoppingCart className={"h-4 w-4 mr-2"} />
              Item
            </Button>
          </Link>

          <Link to={"/app/chart_of_accounts"}>
            <Button
              variant={isActiveLink("chart_of_accounts")}
              className="w-full justify-start"
            >
              <BookMarked className={"h-4 w-4 mr-2"} />
              Chart Of Accounts
            </Button>
          </Link>
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
