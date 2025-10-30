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
import {
  Card,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";

const tokenSchema = z.object({
  token: z.string().optional(),
  error: z.literal("INVALID_TOKEN").optional(),
});

export const Route = createFileRoute("/login/reset-password")({
  component: RouteComponent,
  validateSearch: tokenSchema,
  beforeLoad: ({ search }) => ({ token: search.token }),
});

const MIN_PASSWORD_LENGTH = 8;

function RouteComponent() {
  const { token, error } = Route.useSearch();
  const navigate = useNavigate();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const form = useForm({
    defaultValues: {
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.resetPassword(
        {
          token,
          newPassword: value.password,
        },
        {
          onSuccess: () => {
            toast.success("Password reset successfully");
            navigate({
              to: "/profile",
            });
          },
          onError: (resetError) => {
            toast.error(
              resetError.error.message || resetError.error.statusText
            );
          },
        }
      );
    },
    validators: {
      onSubmit: z.object({
        password: z
          .string()
          .min(MIN_PASSWORD_LENGTH, "Password must be at least 8 characters"),
      }),
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
                  to: "..",
                });
              }}
              variant="ghost"
            >
              <ArrowLeftIcon />
              Back
            </Button>
            <CardTitle className="flex-1 text-center">
              {error ? "Invalid Token" : "Reset Password"}
            </CardTitle>
          </div>
          {!error && (
            <CardDescription>Enter your new password below.</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {error && <div className="text-destructive">Invalid token</div>}
          {token && (
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
                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
