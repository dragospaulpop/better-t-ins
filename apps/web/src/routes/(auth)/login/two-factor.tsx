import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Loader2Icon } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/(auth)/login/two-factor")({
  component: RouteComponent,
});

const TOTP_CODE_LENGTH = 6;

function RouteComponent() {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      code: "",
      trustDevice: false,
    },
    onSubmit: async ({ value }) => {
      await authClient.twoFactor.verifyTotp(
        {
          code: value.code,
          trustDevice: value.trustDevice,
        },
        {
          onSuccess: () => {
            navigate({
              to: "/profile",
              replace: true,
            });
            toast.success("Two-Factor Authentication verified successfully");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        }
      );
    },
    validators: {
      onSubmit: z.object({
        code: z.string().min(TOTP_CODE_LENGTH, "Code must be 6 digits"),
        trustDevice: z.boolean(),
      }),
    },
  });

  return (
    <div className="grid place-items-center p-2">
      <Card className="w-full sm:max-w-md">
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Enter the code from your authenticator app
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
              <form.Field name="code">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <InputOTP
                        aria-invalid={isInvalid}
                        autoFocus
                        containerClassName="justify-center"
                        id={field.name}
                        maxLength={6}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(value) => field.handleChange(value)}
                        pattern={REGEXP_ONLY_DIGITS}
                        value={field.state.value}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot
                            className="h-12 w-12 md:h-14 md:w-14"
                            index={0}
                          />
                          <InputOTPSlot
                            className="h-12 w-12 md:h-14 md:w-14"
                            index={1}
                          />
                          <InputOTPSlot
                            className="h-12 w-12 md:h-14 md:w-14"
                            index={2}
                          />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot
                            className="h-12 w-12 md:h-14 md:w-14"
                            index={3}
                          />
                          <InputOTPSlot
                            className="h-12 w-12 md:h-14 md:w-14"
                            index={4}
                          />
                          <InputOTPSlot
                            className="h-12 w-12 md:h-14 md:w-14"
                            index={5}
                          />
                        </InputOTPGroup>
                      </InputOTP>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
              <form.Field name="trustDevice">
                {(field) => (
                  <Field orientation="horizontal">
                    <Checkbox
                      checked={field.state.value}
                      id={field.name}
                      name={field.name}
                      onCheckedChange={(value) =>
                        field.handleChange(value as boolean)
                      }
                    />
                    <FieldLabel className="font-normal" htmlFor={field.name}>
                      Trust this device for 30 days
                    </FieldLabel>
                  </Field>
                )}
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
                      "Verify Code"
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation="horizontal">
            <FieldLabel htmlFor="sign-up">
              No access to your authenticator app?
            </FieldLabel>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => {
                    navigate({
                      to: "/login/backup-code",
                      from: "/login/two-factor",
                    });
                  }}
                  variant="link"
                >
                  Backup codes
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Try backup codes that were generated when you enabled two-factor
                authentication
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => {
                    authClient.twoFactor.sendOtp(
                      {},
                      {
                        onSuccess: () => {
                          toast.success("OTP code sent successfully");
                          navigate({
                            to: "/login/otp",
                            from: "/login/two-factor",
                          });
                        },
                        onError: (error) => {
                          toast.error(
                            error.error.message || error.error.statusText
                          );
                        },
                      }
                    );
                  }}
                  variant="link"
                >
                  OTP
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Email a one-time password (OTP) code to your email address
              </TooltipContent>
            </Tooltip>
          </Field>
        </CardFooter>
      </Card>
    </div>
  );
}
