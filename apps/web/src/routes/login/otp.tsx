import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { ArrowLeftIcon, Loader2Icon } from "lucide-react";
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
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/login/otp")({
  component: RouteComponent,
});

const OTP_CODE_LENGTH = 6;
const OTP_CODE_REGEXP = REGEXP_ONLY_DIGITS;

const formSchema = z.object({
  code: z.string().min(OTP_CODE_LENGTH, "OTP code must be 6 digits"),
  trustDevice: z.boolean(),
});

function RouteComponent() {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      code: "",
      trustDevice: false,
    },
    onSubmit: async ({ value }) => {
      await authClient.twoFactor.verifyOtp(
        {
          code: value.code,
          trustDevice: value.trustDevice,
        },
        {
          onSuccess: () => {
            navigate({
              to: "/dashboard",
            });
            toast.success("OTP code verified successfully");
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
                  to: "..",
                });
              }}
              variant="ghost"
            >
              <ArrowLeftIcon />
              Back
            </Button>

            <CardTitle className="flex-1 text-center">Enter OTP Code</CardTitle>
          </div>
          <CardDescription>
            Login with the OTP code you received in your email. This code will
            expire in 3 minutes.
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
                        maxLength={OTP_CODE_LENGTH}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(value) => field.handleChange(value)}
                        pattern={OTP_CODE_REGEXP}
                        value={field.state.value}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot
                            className="h-8 w-8 md:h-10 md:w-10"
                            index={0}
                          />
                          <InputOTPSlot
                            className="h-8 w-8 md:h-10 md:w-10"
                            index={1}
                          />
                          <InputOTPSlot
                            className="h-8 w-8 md:h-10 md:w-10"
                            index={2}
                          />
                          <InputOTPSeparator />
                          <InputOTPSlot
                            className="h-8 w-8 md:h-10 md:w-10"
                            index={3}
                          />
                          <InputOTPSlot
                            className="h-8 w-8 md:h-10 md:w-10"
                            index={4}
                          />
                          <InputOTPSlot
                            className="h-8 w-8 md:h-10 md:w-10"
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
          <Button
            className="flex-1"
            onClick={() => {
              authClient.twoFactor.sendOtp(
                {},
                {
                  onSuccess: () => {
                    toast.success("OTP code resent successfully");
                  },
                  onError: (error) => {
                    toast.error(error.error.message || error.error.statusText);
                  },
                }
              );
            }}
            type="button"
            variant="link"
          >
            Resend Code
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
