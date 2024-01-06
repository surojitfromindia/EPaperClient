"use client";

import * as React from "react";
import { FormEvent, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils.ts";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input.tsx";
import { useNavigate } from "react-router-dom";
import AuthenticationService, {
  SignUpPayload,
} from "@/API/Authentication/v1/loginService.ts";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { contactSchema } from "@/components/app/common/ValidationSchemas/ContactAndContactPersonSchema.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form.tsx";
import { FormValidationErrorAlert } from "@/components/app/common/FormValidationErrorAlert.tsx";
import { LocalStorageAccess } from "@/util/LocalStorageAccess.ts";
import { AppURLPaths } from "@/constants/AppURLPaths.Constants.ts";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CustomElements extends HTMLFormControlsCollection {
  email: HTMLInputElement;
  password: HTMLInputElement;
}

interface SignInForm extends HTMLFormElement {
  readonly elements: CustomElements;
}

const validationSchema = z
  .object({
    first_name: z.string().min(2, { message: "First name is too short" }),
    last_name: z.string().min(2, { message: "Last name is too short" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password is too short" }),
    // confirm password must match with password
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

export default function SignUpForm({ className, ...props }: UserAuthFormProps) {
  // library states
  const navigate = useNavigate();

  // local states
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errorMessagesForBanner, setErrorMessagesForBanner] = useState<
    string[]
  >([]);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const form = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
  });
  const { register, handleSubmit } = form;

  const handleFormSubmit: SubmitHandler<
    z.infer<typeof validationSchema>
  > = async (data) => {
    setIsLoading(true);

    const signUpPayload: SignUpPayload = {
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      password: data.password,
    };

    try {
      LocalStorageAccess.removeToken();
      await AuthenticationService.signUp(signUpPayload);
      navigate(AppURLPaths.SIGN_IN);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessagesForBanner([error.message]);
      }
      console.error("Hit error");
    } finally {
      setIsLoading(false);
    }
  };
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div>
      <div className="mx-auto flex flex-col justify-center space-y-6 w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Lets Go.</h1>
          <p className="text-sm text-muted-foreground">
            Create an account to get started.
          </p>
        </div>
        <div className={cn("grid gap-6", className)} {...props}>
          <div className={"px-5"}>
            <FormValidationErrorAlert messages={errorMessagesForBanner} />
          </div>
          <Form {...form}>
            <form>
              <div className={"grid gap-2"}>
                <div className={"grid grid-cols-2 gap-2"}>
                  <FormField
                    render={() => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...register("first_name")}
                            placeholder={"First Name"}
                            autoComplete={"off"}
                            autoCorrect={"off"}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                    name={"first_name"}
                  />
                  <FormField
                    render={() => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...register("last_name")}
                            placeholder={"Last Name"}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                    name={"last_name"}
                  />
                </div>

                <FormField
                  render={() => (
                    <FormItem>
                      <FormControl>
                        <Input {...register("email")} placeholder={"Email"} />
                      </FormControl>
                    </FormItem>
                  )}
                  name={"email"}
                />
                <FormField
                  render={() => (
                    <FormItem>
                      <FormControl>
                        <div className={"relative"}>
                          <Input
                            autoComplete={"off"}
                            type={showPassword ? "text" : "password"}
                            {...register("password")}
                            placeholder={"Password"}
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 cursor-pointer">
                            {showPassword ? (
                              <EyeOff
                                className="h-4 w-4"
                                onClick={togglePasswordVisibility}
                              />
                            ) : (
                              <Eye
                                className="h-4 w-4"
                                onClick={togglePasswordVisibility}
                              />
                            )}
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                  name={"password"}
                />
                <FormField
                  render={() => (
                    <FormItem>
                      <FormControl>
                        <Input
                          autoComplete={"off"}
                          type={"password"}
                          {...register("confirm_password")}
                          placeholder={"Confirm Password"}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                  name={"confirm_password"}
                />

                <Button
                  className={"mt-2 uppercase text-xs"}
                  disabled={isLoading}
                  onClick={handleSubmit(handleFormSubmit)}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
