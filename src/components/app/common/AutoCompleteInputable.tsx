"use client";

import {
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from "@/components/ui/command.tsx";
import { Command as CommandPrimitive } from "cmdk";
import { useState, useRef, useCallback, type KeyboardEvent } from "react";

import { cn } from "@/lib/utils.ts";
import { Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Input } from "@/components/ui/input.tsx";

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
}: AutoCompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setOpen] = useState(false);
  const [selected, setSelected] = useState<Option>(value as Option);
  const [inputValue, setInputValue] = useState<string>(value?.label || "");

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

      // This is not a default behaviour of the <input /> field
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
    if (last_selected_label &&last_selected_label.toLowerCase() === input_text.toLowerCase()) {
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
    <CommandPrimitive onKeyDown={handleKeyDown}>
      <div>
        <CommandInput
          ref={inputRef}
          value={inputValue}
          onValueChange={isLoading ? undefined : setInputValue}
          onBlur={handleBlur}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={textInputClassNames}
        ></CommandInput>
      </div>
      <div className="relative">
        {isOpen ? (
          <div className="absolute mt-3 top-0 z-50 w-full rounded-xl bg-stone-50 outline-none animate-in fade-in-0 zoom-in-95">
            <CommandList className="ring-1 ring-slate-200 rounded-sm max-h-40 overflow-y-scroll">
              {isLoading ? (
                <CommandPrimitive.Loading>
                  <div className="p-1">
                    <Skeleton className="h-8 w-full" />
                  </div>
                </CommandPrimitive.Loading>
              ) : null}
              {options.length > 0 && !isLoading ? (
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
              {!isLoading ? (
                <CommandPrimitive.Empty className="select-none rounded-sm px-2 py-3 text-sm text-center">
                  {emptyMessage}
                </CommandPrimitive.Empty>
              ) : null}
            </CommandList>
          </div>
        ) : null}
      </div>
    </CommandPrimitive>
  );
}
