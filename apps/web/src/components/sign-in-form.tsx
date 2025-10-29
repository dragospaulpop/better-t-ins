import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import {
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  LockIcon,
  MailIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { authClient } from "@/lib/auth-client";
import Loader from "./loader";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./ui/input-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const MIN_PASSWORD_LENGTH = 8;

export default function SignInForm({
  onSwitchToSignUp,
}: {
  onSwitchToSignUp: () => void;
}) {
  const navigate = useNavigate({
    from: "/",
  });
  const { isPending } = authClient.useSession();
  const [isPassWordVisible, setIsPassWordVisible] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: ({ data }) => {
            if (data.twoFactorRedirect) {
              navigate({
                to: "/login/two-factor",
              });
              toast.success(
                "Please se your authenticator app to complete the sign in process"
              );
            } else {
              navigate({
                to: "/dashboard",
              });
              toast.success("Sign in successful");
            }
          },
          onError: (error) => {
            if (error?.error?.code === "EMAIL_NOT_VERIFIED") {
              toast.error(
                "Email not verified. Check your email for a verification link.",
                {
                  action: {
                    label: "Resend email",
                    onClick: () => {
                      authClient.sendVerificationEmail(
                        {
                          email: value.email,
                          callbackURL: `${window.location.origin}/dashboard`,
                        },
                        {
                          onSuccess: () => {
                            toast.success("Verification email sent");
                          },
                          onError: (emailError) => {
                            toast.error(
                              emailError.error.message ||
                                emailError.error.statusText
                            );
                          },
                        }
                      );
                    },
                  },
                }
              );
            } else {
              toast.error(error.error.message || error.error.statusText);
            }
          },
        }
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
        password: z
          .string()
          .min(MIN_PASSWORD_LENGTH, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="grid place-items-center p-2">
      <Card className="w-full sm:max-w-md">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your account to continue.
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
            <FieldGroup className="">
              <form.Field name="email">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          aria-invalid={isInvalid}
                          autoComplete="off"
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Your email"
                          type="email"
                          value={field.state.value}
                        />
                        <InputGroupAddon>
                          <MailIcon />
                        </InputGroupAddon>
                      </InputGroup>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="password">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <InputGroup>
                        <InputGroupAddon>
                          <LockIcon />
                        </InputGroupAddon>
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Your password"
                          type={isPassWordVisible ? "text" : "password"}
                          value={field.state.value}
                        />
                        <InputGroupAddon align="inline-end">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InputGroupButton
                                className="rounded-full"
                                onClick={() =>
                                  setIsPassWordVisible(!isPassWordVisible)
                                }
                                size="icon-xs"
                              >
                                {isPassWordVisible ? (
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
                  <Field>
                    <Button
                      className="w-full"
                      disabled={!state.canSubmit || state.isSubmitting}
                      type="submit"
                    >
                      {state.isSubmitting ? (
                        <Loader2Icon className="animate-spin" />
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </Field>
                )}
              </form.Subscribe>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation="horizontal">
            <FieldLabel htmlFor="sign-up">Need an account? Sign Up</FieldLabel>
            <Button onClick={onSwitchToSignUp} variant="link">
              Sign Up
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </div>
  );
}
