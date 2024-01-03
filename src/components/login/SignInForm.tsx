"use client";

import * as React from "react";
import { FormEvent } from "react";

import { cn } from "@/lib/utils.ts";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input.tsx";
import { Link, useNavigate } from "react-router-dom";
import AuthenticationService, {
  LoginWithEmailPayload,
} from "@/API/Authentication/v1/loginService.ts";
import { Loader2 } from "lucide-react";

import {LocalStorageAccess} from "@/util/LocalStorageAccess.ts";
import {AppURLPaths} from "@/constants/AppURLPaths.Constants.ts";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CustomElements extends HTMLFormControlsCollection {
  email: HTMLInputElement;
  password: HTMLInputElement;
}

interface SignInForm extends HTMLFormElement {
  readonly elements: CustomElements;
}

export default function SignInForm({ className, ...props }: UserAuthFormProps) {
  // library states
  const navigate = useNavigate();

  // local states
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  async function onSubmit(event: FormEvent<SignInForm>) {
    event.preventDefault();
    setIsLoading(true);

    const target = event.currentTarget.elements;
    const loginPayload: LoginWithEmailPayload = {
      email: target.email.value,
      password: target.password.value,
    };

    try {
      LocalStorageAccess.removeToken();
      const { token } =
        await AuthenticationService.loginWithEmail(loginPayload);
      LocalStorageAccess.saveToken(token)
      navigate("/app/dashboard");
    } catch (error) {
      console.error("Hit error",error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div className="mx-auto flex flex-col justify-center space-y-6 w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email below to login in your account
          </p>
        </div>
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

              <Button className={"mt-2 uppercase text-xs"} type={"submit"} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
              <div className={"text-center my-1 text-sm"}>
                OR
              </div>
              <Button className={"uppercase text-xs"} asChild variant={"secondary"}>
                <Link to={AppURLPaths.SIGN_UP}>Create New Account</Link>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
