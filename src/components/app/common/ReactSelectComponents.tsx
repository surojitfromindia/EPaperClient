import { components, OptionProps } from "react-select";
import { Button } from "@/components/ui/button.tsx";
import { Trash } from "lucide-react";
import { makeUnitRSelectOptions } from "@/components/app/common/reactSelectOptionCompositions.ts";

const ReactSelectOptionComponentsUnit = (
  props: OptionProps<ReturnType<typeof makeUnitRSelectOptions>>,
) => {
  return (
    <components.Option {...props}>
      <div className={"flex items-center justify-between"}>
        <div>{props.children}</div>
        <div>
          <Button
            size={"icon"}
            variant={"ghost"}
            className={"p-1 h-5 w-5"}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            {!props.isSelected && <Trash className={"w-3 h-3"} />}
          </Button>
        </div>
      </div>
    </components.Option>
  );
};

export { ReactSelectOptionComponentsUnit };
