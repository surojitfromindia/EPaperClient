"use client";

import {
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from "@/components/ui/command.tsx";
import { Command as CommandPrimitive } from "cmdk";
import {
  useState,
  useRef,
  useCallback,
  type KeyboardEvent,
  useEffect,
} from "react";

import { cn } from "@/lib/utils.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { ValidityUtil } from "@/util/ValidityUtil.ts";

export type Option = Record<"value" | "label", string> & Record<string, string>;

type AutoCompleteProps = {
  options: Option[];
  emptyMessage: string;
  value?: Option;
  onValueChange?: (value: Option) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  textInputClassNames?: string;
  inputId?: string;
};

export default function AutoComplete({
  options,
  placeholder,
  emptyMessage,
  value,
  onValueChange,
  disabled,
  isLoading = false,
  textInputClassNames,
  inputId,
}: AutoCompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  if (inputRef.current && ValidityUtil.isNotEmpty(inputId)) {
    inputRef.current.id = inputId;
  }

  const [isOpen, setOpen] = useState(false);
  const [selected, setSelected] = useState<Option>(value as Option);
  const [inputValue, setInputValue] = useState<string>(value?.label || "");
  const [applyFilter, setApplyFilter] = useState(true);

  const handleFocus = useCallback(() => {
    setOpen(true);
    setApplyFilter(false);
  }, []);

  const handleOnChange = useCallback((value) => {
    setInputValue(value);
    setApplyFilter(true);
  }, []);

  useEffect(() => {
    if (value) {
      setInputValue(value.label);
      setSelected(value);
    }
  }, [value]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (!input) {
        return;
      }

      // Keep the options displayed when the user is typing
      if (!isOpen) {
        setOpen(true);
      }

      // This is not a default behavior of the <input /> field
      if (event.key === "Enter" && input.value !== "") {
        const optionToSelect = options.find(
          (option) => option.label === input.value,
        );
        if (optionToSelect) {
          setSelected(optionToSelect);
          onValueChange?.(optionToSelect);
        }
      }

      if (event.key === "Escape") {
        input.blur();
      }
    },
    [isOpen, options, onValueChange],
  );

  const handleBlur = useCallback(() => {
    setOpen(false);
    const input_text = inputRef.current?.value;
    const last_selected_label = selected?.label;
    let new_selected: Option;
    if (
      last_selected_label &&
      last_selected_label.toLowerCase() === input_text.toLowerCase()
    ) {
      setInputValue(last_selected_label);
      new_selected = selected;
    } else {
      setInputValue(input_text || "");
      new_selected = { label: input_text, value: input_text };
    }
    onValueChange?.(new_selected);
  }, [selected]);

  const handleSelectOption = useCallback(
    (selectedOption: Option) => {
      setInputValue(selectedOption.label);
      setSelected(selectedOption);

      // This is a hack to prevent the input from being focused after the user selects an option
      // We can call this hack: "The next tick"
      setTimeout(() => {
        inputRef?.current?.blur();
      }, 0);
    },
    [onValueChange],
  );

  return (
    <CommandPrimitive onKeyDown={handleKeyDown} shouldFilter={applyFilter}>
      <div>
        {applyFilter}
        <CommandInput
          ref={inputRef}
          value={inputValue}
          onValueChange={handleOnChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={textInputClassNames}
        ></CommandInput>
      </div>
      <div className="relative">
        {isOpen && ValidityUtil.isNotEmpty(options) ? (
          <div className="absolute mt-3 top-0 z-50 w-full rounded-xl bg-stone-50 outline-none animate-in fade-in-0 zoom-in-95">
            <CommandList className="ring-1 ring-slate-200 rounded-sm max-h-28 overflow-y-auto">
              {isLoading ? (
                <CommandPrimitive.Loading>
                  <div className="p-1">
                    <Skeleton className="h-8 w-full" />
                  </div>
                </CommandPrimitive.Loading>
              ) : null}
              {!isLoading ? (
                <CommandGroup>
                  {options.map((option) => {
                    const isSelected = selected?.value === option.value;
                    return (
                      <CommandItem
                        key={option.value}
                        value={option.label}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                        onSelect={() => handleSelectOption(option)}
                        className={cn(
                          "flex justify-between w-full p-2",
                          isSelected
                            ? "after:content-['✓'] !bg-primary !text-primary-foreground"
                            : "",
                        )}
                      >
                        {option.label}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ) : null}
            </CommandList>
          </div>
        ) : null}
      </div>
    </CommandPrimitive>
  );
}
