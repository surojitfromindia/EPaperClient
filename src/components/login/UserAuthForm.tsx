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

import CommandMenu, {Option} from "@/components/login/BBN.tsx";


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


  const FRAMEWORKS = [
    {
      value: "next.js",
      label: "Next.js",
    },
    {
      value: "sveltekit",
      label: "SvelteKit",
    },
    {
      value: "nuxt.js",
      label: "Nuxt.js",
    },
    {
      value: "remix",
      label: "Remix",
    },
    {
      value: "astro",
      label: "Astro",
    },
    {
      value: "wordpress",
      label: "WordPress",
    },
    {
      value: "express.js",
      label: "Express.js",
    },
    {
      value: "nest.js",
      label: "Nest.js",
    },
  ]
  const [isDisabled, setDisbled] = useState(false)
  const [value, setValue] = useState<Option>()

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
          <CommandMenu
              options={FRAMEWORKS}
              emptyMessage="No resulsts."
              placeholder="Find something"
              isLoading={isLoading}
              onValueChange={setValue}
              value={value}
              disabled={isDisabled}
          />

          <Button type={"submit"} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In with Email
          </Button>
        </div>
      </form>
    </div>
  );
}




