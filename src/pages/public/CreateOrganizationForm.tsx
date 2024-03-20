"use client";

import * as React from "react";
import { useState } from "react";

import { cn } from "@/lib/utils.ts";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form.tsx";
import { FormValidationErrorAlert } from "@/components/app/common/FormValidationErrorAlert.tsx";
import { AppURLPaths } from "@/constants/AppURLPaths.Constants.ts";
import OrganizationService from "@/API/Resources/v1/Organization/Organization.Service.ts";
import { ValidityUtil } from "@/util/ValidityUtil.ts";
import { LocalStorageAccess } from "@/util/LocalStorageAccess.ts";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}
const validationSchema = z.object({
  name: z.string().min(2, { message: "Name is too short" }),
  country_code: z.string(),
  country_code_label: z.string().optional(),
  currency_code: z.string(),
  currency_code_label: z.string().optional(),
  sector: z.string(),
  sector_label: z.string().optional(),
  primary_address: z.string(),
});

const organizationService = new OrganizationService();

export default function CreateOrganizationForm({
  className,
  ...props
}: UserAuthFormProps) {
  // library states
  const navigate = useNavigate();

  // local states
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errorMessagesForBanner, setErrorMessagesForBanner] = useState<
    string[]
  >([]);

  const form = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
  });
  const { register, handleSubmit } = form;

  const handleFormSubmit: SubmitHandler<
    z.infer<typeof validationSchema>
  > = async (data) => {
    setIsLoading(true);

    const createOrganizationPayload = {
      name: data.name,
      country_code: data.country_code,
      currency_code: data.currency_code,
      sector: data.sector,
      primary_address: data.primary_address,
    };

    try {
      const organization_created_data =
        await organizationService.registerOrganization({
          payload: createOrganizationPayload,
        });
      if (ValidityUtil.isNotEmpty(organization_created_data)) {
        // add organization id to local storage
        LocalStorageAccess.saveOrganizationId(
          organization_created_data.organization.organization_id.toString(),
        );
        // and dashboard
        navigate(AppURLPaths.APP_PAGE.APP_HOME.INDEX);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessagesForBanner([error.message]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mx-auto flex flex-col justify-center space-y-6 w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            New Organization
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new organization OR join an existing one
          </p>
        </div>
        <div className={cn("grid gap-6", className)} {...props}>
          <div className={"px-5"}>
            <FormValidationErrorAlert messages={errorMessagesForBanner} />
          </div>
          <Form {...form}>
            <form>
              <div className={"grid gap-2"}>
                <FormField
                  render={() => (
                    <FormItem>
                      <FormControl>
                        <Input {...register("name")} placeholder={"Name"} />
                      </FormControl>
                    </FormItem>
                  )}
                  name={"name"}
                />

                <div className={"grid grid-cols-2 gap-2"}>
                  <FormField
                    render={() => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...register("country_code")}
                            placeholder={"Country"}
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
                            {...register("currency_code")}
                            placeholder={"Currency"}
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
                        <Input {...register("sector")} placeholder={"Sector"} />
                      </FormControl>
                    </FormItem>
                  )}
                  name={"sector"}
                />

                <FormField
                  render={() => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...register("primary_address")}
                          placeholder={"Address"}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                  name={"primary_address"}
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
