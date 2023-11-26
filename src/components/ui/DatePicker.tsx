import * as React from "react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { useEffect } from "react";

export function DatePicker({
  value,
  className = "",
  onChange,
  dashedBorder = false,
    ...props
}) {
  const [date, setDate] = React.useState<Date>(value);
  const handleChanges = (date: Date) => {
    setDate(date);
    onChange?.(date);
  };
  useEffect(() => {
    setDate(value);
  }, [value]);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className,
            dashedBorder && "border-dashed",
          )}
          id={props.id}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleChanges}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
