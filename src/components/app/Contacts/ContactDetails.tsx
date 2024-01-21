import { Button } from "@/components/ui/button.tsx";
import { ChevronDown, Edit, Pencil, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import * as React from "react";

function ContactDetails() {
  return (
    <main className={"flex flex-col h-screen "}>
      <section className={"pl-5 pr-2 py-3 "}>
        <div className={"flex items-center justify-between h-10"}>
          <div className={"flex flex-col"}>
            <span className={"font-medium text-xl"}>ABC Man</span>
          </div>
          <div>
            <span className={"text-xs flex space-x-1"}>
              <Button variant={"outline"} size={"icon"}>
                <Pencil className={"w-4 h-4"} />
              </Button>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant={"outline"}>
                    More
                    <ChevronDown className={"w-4 h-4 ml-1"} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="text-sm  bg-gray-50 outline-none  p-1"
                  align={"end"}
                >
                  <DropdownMenuItem className={"menu-item-ok"} role={"button"}>
                    <Edit className={"h-4 w-4"} />
                    <span>Configure</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={"menu-item-danger"}
                    role={"button"}
                  >
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant={"ghost"}>
                <X className={"w-4 h-4"} />
              </Button>
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ContactDetails;
