import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  LockIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/profile/change-password")({
  component: RouteComponent,
});

const MIN_PASSWORD_LENGTH = 8;

const formSchema = z
  .object({
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH, "Password must be at least 8 characters"),
    newPassword: z
      .string()
      .min(MIN_PASSWORD_LENGTH, "New password must be at least 8 characters"),
    confirmNewPassword: z
      .string()
      .min(
        MIN_PASSWORD_LENGTH,
        "Confirm new password must be at least 8 characters"
      ),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "Passwords do not match",
  });
function RouteComponent() {
  const navigate = useNavigate();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const form = useForm({
    defaultValues: {
      password: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.changePassword(
        {
          newPassword: value.newPassword,
          currentPassword: value.password,
          revokeOtherSessions: true,
        },
        {
          onSuccess: () => {
            toast.success("Password changed successfully");
            navigate({
              to: "/profile",
            });
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        }
      );
    },
    validators: {
      onSubmit: formSchema,
    },
  });

  return (
    <div className="grid place-items-center p-2">
      <Card className="w-full sm:max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button
              onClick={() => {
                navigate({
                  to: "/profile",
                });
              }}
              variant="ghost"
            >
              <ArrowLeftIcon />
              Back
            </Button>
            <CardTitle className="flex-1 text-center">
              Change Password
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field name="password">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Current Password
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Your current password"
                          type={isPasswordVisible ? "text" : "password"}
                          value={field.state.value}
                        />
                        <InputGroupAddon>
                          <LockIcon />
                        </InputGroupAddon>
                        <InputGroupAddon align="inline-end">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InputGroupButton
                                className="rounded-full"
                                onClick={() =>
                                  setIsPasswordVisible(!isPasswordVisible)
                                }
                                size="icon-xs"
                              >
                                {isPasswordVisible ? (
                                  <EyeOffIcon />
                                ) : (
                                  <EyeIcon />
                                )}
                              </InputGroupButton>
                            </TooltipTrigger>
                            <TooltipContent>
                              Toggle password visibility
                            </TooltipContent>
                          </Tooltip>
                        </InputGroupAddon>
                      </InputGroup>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
              <form.Field name="newPassword">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Your new password"
                          type={isPasswordVisible ? "text" : "password"}
                          value={field.state.value}
                        />
                        <InputGroupAddon>
                          <LockIcon />
                        </InputGroupAddon>
                        <InputGroupAddon align="inline-end">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InputGroupButton
                                className="rounded-full"
                                onClick={() =>
                                  setIsPasswordVisible(!isPasswordVisible)
                                }
                                size="icon-xs"
                              >
                                {isPasswordVisible ? (
                                  <EyeOffIcon />
                                ) : (
                                  <EyeIcon />
                                )}
                              </InputGroupButton>
                            </TooltipTrigger>
                            <TooltipContent>
                              Toggle password visibility
                            </TooltipContent>
                          </Tooltip>
                        </InputGroupAddon>
                      </InputGroup>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
              <form.Field name="confirmNewPassword">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Confirm New Password
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Confirm your new password"
                          type={isPasswordVisible ? "text" : "password"}
                          value={field.state.value}
                        />
                        <InputGroupAddon>
                          <LockIcon />
                        </InputGroupAddon>
                        <InputGroupAddon align="inline-end">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InputGroupButton
                                className="rounded-full"
                                onClick={() =>
                                  setIsPasswordVisible(!isPasswordVisible)
                                }
                                size="icon-xs"
                              >
                                {isPasswordVisible ? (
                                  <EyeOffIcon />
                                ) : (
                                  <EyeIcon />
                                )}
                              </InputGroupButton>
                            </TooltipTrigger>
                            <TooltipContent>
                              Toggle password visibility
                            </TooltipContent>
                          </Tooltip>
                        </InputGroupAddon>
                      </InputGroup>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
              <form.Subscribe>
                {(state) => (
                  <Button
                    className="w-full"
                    disabled={!state.canSubmit || state.isSubmitting}
                    type="submit"
                  >
                    {state.isSubmitting ? (
                      <Loader2Icon className="animate-spin" />
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
