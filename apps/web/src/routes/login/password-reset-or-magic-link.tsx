import { useForm } from "@tanstack/react-form";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon, Loader2Icon, MailIcon } from "lucide-react";
import { useCallback } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { authClient } from "@/lib/auth-client";
import RecaptchaNotice from "./-components/recaptcha-notice";

export const Route = createFileRoute("/login/password-reset-or-magic-link")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (session.data) {
      redirect({
        to: "/dashboard",
        throw: true,
      });
    }
    return { session };
  },
});

const formSchema = z.object({
  email: z.email("Invalid email address"),
  resetOrMagicLink: z.enum(["reset", "magic-link"]),
});

function RouteComponent() {
  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const verifyRecaptcha = useCallback(async () => {
    if (!executeRecaptcha) {
      toast.error("Failed to verify reCAPTCHA");
      return null;
    }
    const token = await executeRecaptcha("password-reset-or-magic-link");
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
        await authClient.requestPasswordReset(
          {
            email: value.email,
            redirectTo: `${window.location.origin}/login/reset-password`,
          },
          {
            headers: {
              "x-captcha-response": token,
            },
            onSuccess: () => {
              toast.success(
                "If this email exists in our system, check your email for the reset link"
              );
            },
            onError: (error) => {
              toast.error(error.error.message || error.error.statusText);
            },
          }
        );
      } else if (value.resetOrMagicLink === "magic-link") {
        await authClient.signIn.magicLink(
          {
            email: value.email,
            callbackURL: `${window.location.origin}/dashboard`,
          },
          {
            onSuccess: () => {
              toast.success("Magic link sent");
            },
            onError: (error) => {
              toast.error(error.error.message || error.error.statusText);
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
              Reset Password or Login with a magic link
            </CardTitle>
          </div>
          <CardDescription>
            Enter your email to reset your password or login with a magic link.
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
                      <FieldLabel>Email type</FieldLabel>
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
                          <RadioGroupItem id="magic-link" value="magic-link" />
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
                    {state.isSubmitting ? (
                      <Loader2Icon className="animate-spin" />
                    ) : (
                      "Send email"
                    )}
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
  );
}
