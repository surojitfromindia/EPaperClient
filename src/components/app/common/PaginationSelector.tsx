import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {useEffect, useState} from "react";
import { Bolt, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { Link } from "react-router-dom";
import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
} from "@/constants/Pagination.Constants.ts";

function PaginationSelector({
  perPage = DEFAULT_PAGE_SIZE,
  hasMore = false,
  currentPage = DEFAULT_PAGE_NUMBER,
  currentRecords = 0,
  onPerPageChange,
  onPageChange,
}) {
  const allowedPerPage = [5, 10, 20, 30, 50, 80, 100, 200];
  const [perPageValue, setPerPageValue] = useState(perPage);
  useEffect(() => {
    setPerPageValue(perPage);

  }, [perPage]);

  const showPerPageLabel = allowedPerPage.includes(perPageValue);

  const handlePerPageChange = (value: number) => {
    setPerPageValue(value);
    // and an optional callback
    if (onPerPageChange) {
      onPerPageChange(value);
    }
  };

  const prevPageDisabled = currentPage === 1;
  const nextPageDisabled = !hasMore;

  const handleNextPage = () => {
    if(nextPageDisabled) return;
    if (onPageChange) {
      onPageChange(currentPage + 1);
    }
  };
  const handlePreviousPage = () => {
    if(prevPageDisabled) return;
    if (onPageChange) {
      onPageChange(currentPage - 1);
    }
  };
  if(currentRecords === 0) return <></>

  return (
    <div className="inline-flex">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={
              "border-r-0 rounded-r-none text-muted-foreground hover:!text-primary px-2"
            }
          >
            <Bolt className={"h-4 w-4 mr-1"} />
            {showPerPageLabel && (
              <span className={""}>{perPageValue} per page</span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-36">
          {allowedPerPage.map((value) => {
            return (
              <DropdownMenuItem
                className={cn(
                  "menu-item-ok font-medium",
                  value === perPageValue && "menu-item-checked",
                )}
                key={value}
                onClick={() => {
                  handlePerPageChange(value);
                }}
                role={"button"}
              >
                <div className={"w-full "}>{value} per page</div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className={"flex items-center border rounded-r px-2 gap-x-1"}>
        <div
          className={cn("link_blue", currentPage === 1 && "link_disabled")}
        >
          <ChevronLeft className={"h-4 w-4 "} onClick={handlePreviousPage} />
        </div>
        <div className={"text-sm"}>
          <span>{(currentPage - 1) * perPageValue + 1}</span>
          <span> - </span>
          <span>
            {hasMore
              ? currentPage * perPageValue
              : (currentPage - 1) * perPageValue + currentRecords}
          </span>
        </div>
        <div className={cn("link_blue", !hasMore && "link_disabled link_blue")}
        >
          <ChevronRight className={"h-4 w-4"} onClick={handleNextPage} />
        </div>
      </div>
    </div>
  );
}
export default PaginationSelector;
