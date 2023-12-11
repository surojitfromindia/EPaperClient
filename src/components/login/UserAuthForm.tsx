"use client";

import * as React from "react";
import { FormEvent, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils.ts";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input.tsx";
import { useNavigate } from "react-router-dom";
import AuthenticationService, {
  LoginWithEmailPayload,
} from "@/API/Authentication/v1/loginService.ts";
import { Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command.tsx";
import { CheckIcon } from "@radix-ui/react-icons";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CustomElements extends HTMLFormControlsCollection {
  email: HTMLInputElement;
  password: HTMLInputElement;
}

interface LoginForm extends HTMLFormElement {
  readonly elements: CustomElements;
}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  // library states
  const navigate = useNavigate();

  // local states
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  async function onSubmit(event: FormEvent<LoginForm>) {
    event.preventDefault();
    setIsLoading(true);

    const target = event.currentTarget.elements;
    const loginPayload: LoginWithEmailPayload = {
      email: target.email.value,
      password: target.password.value,
    };

    try {
      const { token } =
        await AuthenticationService.loginWithEmail(loginPayload);
      localStorage.setItem("_ePaperC", token);
      navigate("/app/dashboard");
    } catch (error) {
      console.error("Hit error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label className="sr-only" htmlFor="password">
              Password
            </Label>
            <Input
              id="password"
              placeholder={"password"}
              type="password"
              autoCapitalize="none"
              autoCorrect="off"
              disabled={isLoading}
              autoComplete={"current-password"}
            />
          </div>
          <Button type={"submit"} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In with Email
          </Button>
          {/*<AutoCompleteInput />*/}
        </div>
      </form>
    </div>
  );
}

function AutoCompleteInput() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  const salutations = [
    {
      value: "Mr",
      label: "Mr",
    },
    {
      value: "Mrs",
      label: "Mrs",
    },
    {
      value: "Miss",
      label: "Miss",
    },
    {
      value: "Ms",
      label: "Ms",
    },
    {
      value: "Dr",
      label: "Dr",
    },
    {
      value: "Mrs",
      label: "Mrs",
    },
    {
      value: "Miss",
      label: "Miss",
    },
    {
      value: "Ms",
      label: "Ms",
    },
    {
      value: "Dr",
      label: "Dr",
    },
  ];
  const [visibleOptions, setVisibleOptions] = useState(salutations);

  const View = ({ option }) => <div>{option.label}</div>;
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

  const handleSelect = (option) => {
    setValue(option.value);
    setOpen(false);
  };

  const onSearching = (value) => {
    if (value.length > 0) {
      setVisibleOptions(
        salutations.filter((option) =>
          option.value.toLowerCase().includes(value.toLowerCase()),
        ),
      );
    } else {
      setVisibleOptions(salutations);
    }
    setValue(value);
    setOpen(true);
  };

  const handleOpen = ()=>{
    setOpen(true);
    setVisibleOptions(salutations)
  }

  return (
    <div className={"relative"} id={"acib"} ref={ref}>
      <Input
        value={value}
        onFocus={() => {
          handleOpen()
        }}
        onKeyDown={(event) => {
          // Close the popover when the escape key is pressed
          if (event.key === "Escape") {
            setOpen(false);
          }
          if (event.key === "Enter") {
            setOpen(false);
          }
        }}
        onChange={(event) => {
          onSearching(event.target.value);
        }}
      />
      {open && (
        <div
          className={"absolute z-[100] overflow-y-scroll h-56 mt-2 rounded-sm shadow-md w-full flex flex-col"}
        >
          {visibleOptions.map((option, index) => (
            <div
              className={"p-3 text-sm hover:bg-accent"}
              onClick={() => handleSelect(option)}
            >
              <View option={option} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
