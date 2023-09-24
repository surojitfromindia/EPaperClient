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
    classNames(state.isFocused && "!border-ring !shadow-none", "!text-sm"),
  menuList: () => classNames("!p-2"),
};
const reactSelectComponentOverride = {
  IndicatorSeparator: () => null,
};
export { reactSelectStyle, reactSelectComponentOverride };
