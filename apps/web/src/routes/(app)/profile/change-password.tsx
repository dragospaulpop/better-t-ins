import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  LockIcon,
  RotateCcwKeyIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import PasswordStrengthTooltip from "@/components/password-strength-tooltip";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";
import generatePassword, {
  isStrongEnough,
  passwordStrength,
} from "@/lib/password-generator";

export const Route = createFileRoute("/(app)/profile/change-password")({
  component: RouteComponent,
});

const MIN_PASSWORD_LENGTH_USER = 8;
const MIN_PASSWORD_LENGTH = 16;
const MAX_PASSWORD_LENGTH = 22;

const formSchema = z
  .object({
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH_USER, "Current password can not be empty"),
    newPassword: z
      .string()
      .min(
        MIN_PASSWORD_LENGTH_USER,
        "New password must be at least 8 characters"
      )
      .refine(
        (password) =>
          isStrongEnough(password, {
            minLength: MIN_PASSWORD_LENGTH_USER,
            uppercaseMinCount: 1,
            lowercaseMinCount: 1,
            numberMinCount: 1,
            specialMinCount: 1,
          }),
        "Password must include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character"
      ),
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

const PASSWORD_STRENGTH_TO_COLOR = {
  100: "bg-success",
  50: "bg-warning",
  25: "bg-destructive",
  5: "bg-muted-foreground",
};

function RouteComponent() {
  const navigate = useNavigate();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [passwordStrengthValue, setPasswordStrengthValue] = useState(0);

  const generateRandomPassword = () => {
    const randomLength =
      Math.floor(Math.random() * (MAX_PASSWORD_LENGTH - MIN_PASSWORD_LENGTH)) +
      MIN_PASSWORD_LENGTH;

    return generatePassword(randomLength, true);
  };

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
          <CardAction>
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
          </CardAction>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Enter your current password and a new password.
          </CardDescription>
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
                          onChange={(e) => {
                            field.handleChange(e.target.value);
                            setPasswordStrengthValue(
                              passwordStrength(e.target.value)
                            );
                          }}
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
                                onClick={() => {
                                  const randomPassword =
                                    generateRandomPassword();
                                  field.handleChange(randomPassword);
                                  setPasswordStrengthValue(
                                    passwordStrength(randomPassword)
                                  );
                                  form.setFieldValue(
                                    "confirmNewPassword",
                                    randomPassword
                                  );
                                }}
                                size="icon-xs"
                              >
                                <RotateCcwKeyIcon />
                              </InputGroupButton>
                            </TooltipTrigger>
                            <TooltipContent>
                              Generate random password
                            </TooltipContent>
                          </Tooltip>
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
                      <div className="flex items-center gap-2">
                        <Progress
                          indicatorClassName={
                            PASSWORD_STRENGTH_TO_COLOR[
                              passwordStrengthValue as keyof typeof PASSWORD_STRENGTH_TO_COLOR
                            ] || "bg-muted-foreground"
                          }
                          value={passwordStrengthValue}
                        />
                        <PasswordStrengthTooltip />
                      </div>
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
