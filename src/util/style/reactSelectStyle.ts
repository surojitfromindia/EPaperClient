import { ClassNamesConfig } from "react-select";
import classNames from "classnames";

const reactSelectStyle: ClassNamesConfig = {
  option: (state) =>
    classNames(
      state.isSelected && "!bg-primary",
      state.isFocused && !state.isSelected && "!bg-accent !text-primary",
      "!text-sm",
      "rounded-sm",
    ),
  groupHeading: () => classNames("!text-primary"),

  control: (state) =>
    classNames(
      "!border-input",

      state.isFocused && "!border-ring !shadow-none",
      "!text-sm",
      state.isDisabled && "!cursor-not-allowed",
    ),
  container: (state) =>
    classNames(
      "!border-input",
      state.isDisabled && "!cursor-not-allowed !pointer-events-auto",
    ),

  menuList: () => classNames("!p-2 !max-h-52 overflow-y-scroll"),
};
const reactSelectComponentOverride = {
  IndicatorSeparator: () => null,
};
export { reactSelectStyle, reactSelectComponentOverride };
