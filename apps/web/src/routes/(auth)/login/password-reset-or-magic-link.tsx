import { useForm } from "@tanstack/react-form";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon, MailIcon } from "lucide-react";
import { useCallback } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { toast } from "sonner";
import z from "zod";
import AppTitle from "@/components/app-title";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getAuthErrorMessage } from "@/lib/auth-error";
import { useRequestPasswordReset, useSendMagicLink } from "@/lib/auth-hooks";
import { ensureSessionData } from "@/lib/auth-utils";
import RecaptchaNotice from "./-components/recaptcha-notice";

export const Route = createFileRoute(
  "/(auth)/login/password-reset-or-magic-link"
)({
  beforeLoad: async ({ context }) => {
    const sessionData = await ensureSessionData(context);

    const canAccess = !sessionData?.user;

    if (!canAccess) {
      redirect({
        to: "/dashboard",
        replace: true,
        throw: true,
      });
    }

    return { session: sessionData?.session, user: sessionData?.user };
  },
  component: RouteComponent,
});

const formSchema = z.object({
  email: z.email("Invalid email address"),
  resetOrMagicLink: z.enum(["reset", "magic-link"]),
});

function RouteComponent() {
  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const {
    mutate: requestPasswordReset,
    isPending: isRequestPasswordResetPending,
  } = useRequestPasswordReset();
  const { mutate: sendMagicLink, isPending: isSendMagicLinkPending } =
    useSendMagicLink();

  const verifyRecaptcha = useCallback(async () => {
    if (!executeRecaptcha) {
      toast.error("Failed to verify reCAPTCHA");
      return null;
    }
    const token = await executeRecaptcha("password_reset_or_magic_link");
    if (!token) {
      toast.error("Failed to verify reCAPTCHA");
      return null;
    }
    return token;
  }, [executeRecaptcha]);

  const form = useForm({
    defaultValues: {
      email: "",
      resetOrMagicLink: "reset",
    },
    onSubmit: async ({ value }) => {
      if (value.resetOrMagicLink === "reset") {
        const token = await verifyRecaptcha();
        if (!token) {
          toast.error("Failed to verify reCAPTCHA");
          return;
        }
        requestPasswordReset(
          {
            email: value.email,
            redirectTo: `${window.location.origin}/login/reset-password`,
            fetchOptions: {
              headers: {
                "x-captcha-response": token,
              },
            },
          },
          {
            onSuccess: () => {
              toast.success(
                "If this email exists in our system, check your email for the reset link"
              );
            },
            onError: (error) => {
              toast.error(getAuthErrorMessage(error));
            },
          }
        );
      } else if (value.resetOrMagicLink === "magic-link") {
        await sendMagicLink(
          {
            email: value.email,
            callbackURL: `${window.location.origin}/dashboard`,
          },
          {
            onSuccess: () => {
              toast.success("Magic link sent");
            },
            onError: (error) => {
              toast.error(getAuthErrorMessage(error));
            },
          }
        );
      }
    },
    validators: {
      onSubmit: formSchema,
    },
  });

  return (
    <div className="grid h-full place-items-center p-2">
      <div>
        <AppTitle />
        <Card className="w-full sm:max-w-lg">
          <CardHeader>
            <CardAction>
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
            </CardAction>
            <CardTitle>Reset Password or Login with a magic link</CardTitle>
            <CardDescription>
              Enter your email to reset your password or login with a magic
              link.
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
                <form.Field name="email">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                        <InputGroup>
                          <InputGroupInput
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
                <form.Field name="resetOrMagicLink">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <FieldSet>
                        <FieldLabel>Email message type</FieldLabel>
                        <FieldDescription>
                          Select the type of email you want to receive.
                        </FieldDescription>
                        <RadioGroup
                          defaultValue={field.state.value}
                          onValueChange={(value) => field.handleChange(value)}
                        >
                          <Field orientation="horizontal">
                            <RadioGroupItem id="reset" value="reset" />
                            <FieldLabel className="font-normal" htmlFor="reset">
                              Reset password
                            </FieldLabel>
                          </Field>
                          <Field orientation="horizontal">
                            <RadioGroupItem
                              id="magic-link"
                              value="magic-link"
                            />
                            <FieldLabel
                              className="font-normal"
                              htmlFor="magic-link"
                            >
                              Login with a magic link
                            </FieldLabel>
                          </Field>
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </RadioGroup>
                      </FieldSet>
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
                      <LoadingSwap
                        isLoading={
                          state.isSubmitting ||
                          isRequestPasswordResetPending ||
                          isSendMagicLinkPending
                        }
                      >
                        Send email
                      </LoadingSwap>
                    </Button>
                  )}
                </form.Subscribe>
              </FieldGroup>
            </form>
          </CardContent>
          <CardFooter>
            <RecaptchaNotice />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
