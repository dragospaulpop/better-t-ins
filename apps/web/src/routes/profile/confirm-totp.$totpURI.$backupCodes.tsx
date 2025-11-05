import { useForm } from "@tanstack/react-form";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  ArrowLeftIcon,
  CheckIcon,
  CopyIcon,
  Loader2Icon,
  TriangleAlertIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import z from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
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
import { authClient } from "@/lib/auth-client";

const TOTP_CODE_LENGTH = 6;

export const Route = createFileRoute(
  "/profile/confirm-totp/$totpURI/$backupCodes"
)({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      redirect({
        to: "/login",
        throw: true,
      });
    }

    return { session };
  },
});

const COPIED_TIMEOUT = 2000;

function RouteComponent() {
  const { totpURI, backupCodes } = Route.useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false);
      }, COPIED_TIMEOUT);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

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
    <div className="grid place-items-start p-2">
      <Card className="mx-auto w-full sm:max-w-3xl">
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
              Confirm Two-Factor Authentication
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel className="justify-center" htmlFor="totp-uri">
                    <Badge variant="default">1</Badge>
                    Scan the QR code with your authenticator app
                  </FieldLabel>

                  <QRCode size={256} value={totpURI} />
                </Field>
                <div className="flex flex-col items-center justify-center gap-4">
                  <form.Field name="code">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            <Badge variant="default">2</Badge>
                            Enter the code from your authenticator app
                          </FieldLabel>

                          <InputOTP
                            aria-invalid={isInvalid}
                            autoFocus
                            containerClassName="justify-center"
                            id={field.name}
                            maxLength={TOTP_CODE_LENGTH}
                            name={field.name}
                            onBlur={field.handleBlur}
                            onChange={(value) => field.handleChange(value)}
                            pattern={REGEXP_ONLY_DIGITS}
                            value={field.state.value}
                          >
                            <InputOTPGroup>
                              <InputOTPSlot
                                className="h-12 w-12 md:h-10 md:w-10"
                                index={0}
                              />
                              <InputOTPSlot
                                className="h-12 w-12 md:h-10 md:w-10"
                                index={1}
                              />
                              <InputOTPSlot
                                className="h-12 w-12 md:h-10 md:w-10"
                                index={2}
                              />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                              <InputOTPSlot
                                className="h-12 w-12 md:h-10 md:w-10"
                                index={3}
                              />
                              <InputOTPSlot
                                className="h-12 w-12 md:h-10 md:w-10"
                                index={4}
                              />
                              <InputOTPSlot
                                className="h-12 w-12 md:h-10 md:w-10"
                                index={5}
                              />
                            </InputOTPGroup>
                          </InputOTP>

                          {isInvalid ? (
                            <FieldError errors={field.state.meta.errors} />
                          ) : null}
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
                        <FieldLabel
                          className="font-normal"
                          htmlFor={field.name}
                        >
                          Trust this device for 30 days
                        </FieldLabel>
                      </Field>
                    )}
                  </form.Field>
                  <form.Subscribe>
                    {(state) => (
                      <Button
                        className="w-full md:w-auto"
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
                </div>
              </div>
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter>
          <Field>
            <FieldLabel htmlFor="backup-codes">
              <TriangleAlertIcon className="size-4 text-amber-500" />
              Backup Codes
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(backupCodes);
                  toast.success("Backup codes copied to clipboard");
                  setCopied(true);
                }}
                size="icon-sm"
                variant="ghost"
              >
                {copied ? (
                  <CheckIcon className="size-4 text-success" />
                ) : (
                  <CopyIcon className="size-4" />
                )}
              </Button>
            </FieldLabel>
            <FieldDescription>
              Use one of these codes to login if you lose access to your
              authenticator app. Each code can be used only once.
            </FieldDescription>
            <FieldContent className="grid grid-cols-5 gap-2">
              {backupCodes.split(",").map((code) => (
                <Badge
                  className="w-full text-center"
                  key={code}
                  variant="secondary"
                >
                  {code}
                </Badge>
              ))}
            </FieldContent>
          </Field>
        </CardFooter>
      </Card>
    </div>
  );
}
