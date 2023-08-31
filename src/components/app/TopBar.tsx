import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {LucideSettings} from "lucide-react";
import {Avatar, AvatarFallback} from "@/components/ui/avatar.tsx";
import {Button} from "@/components/ui/button.tsx";

export default function TopBar() {
    return (<div className={"h-12 bg-primary flex items-center w-full shrink-0 text-primary-foreground"}>
            <div className={"logo_container h-12 w-[200px] -m-1 overflow-hidden"}>
                <div className={"logo-collapse flex items-center"}>
                    <span className={"mt-3 mb-3 ml-4 h-6"}>
                        EPaper
                    </span>
                </div>
            </div>
            <div className={"left_top_band mx-2 flex-grow"}>

            </div>
            <div className={"flex items-center"}>
                <div className={"p-2 cursor-pointer"}>
                    <Popover>
                        <PopoverTrigger asChild>
                            <span
                                className={'text-xs mx-2 max-w-[90px] block overflow-hidden whitespace-nowrap overflow-ellipsis'}>Reducer & Play Pvt Ltd.</span>
                        </PopoverTrigger>
                        <PopoverContent className={"p-2 bg-primary border-0 text-primary-foreground"}>
                            <span className={"text-xs"}>Reducer & Play Pvt Ltd.</span>
                        </PopoverContent>
                    </Popover>
                </div>
                <div className={"p-2  flex items-center space-x-3"}>
                    <Button size={"icon"}>
                        <LucideSettings className={"h-4"}/>
                    </Button>
                    <Avatar className={"h-8 w-8"}>
                        <AvatarFallback className={"text-primary"}>S</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </div>)
}