import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { ArrowLeftIcon } from "lucide-react";
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
import { LoadingSwap } from "@/components/ui/loading-swap";
import { getAuthErrorMessage } from "@/lib/auth-error";
import { useSendOtp, useVerifyOtp } from "@/lib/auth-hooks";
import { ensureSessionData } from "@/lib/auth-utils";

export const Route = createFileRoute("/(auth)/login/otp")({
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
  },
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
  const { mutateAsync: verifyOtp, isPending: isVerifyOtpPending } =
    useVerifyOtp();
  const { mutate: sendOtp, isPending: isSendOtpPending } = useSendOtp();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      code: "",
      trustDevice: false,
    },
    onSubmit: async ({ value }) => {
      const { error } = await verifyOtp({
        code: value.code,
        trustDevice: value.trustDevice,
        fetchOptions: {
          throw: false,
        },
      });

      if (error) {
        toast.error(error?.message || "Unknown error");
        return;
      }

      toast.success("OTP code verified successfully");
      await queryClient.resetQueries({ queryKey: ["session"] });
      navigate({ to: "/profile", replace: true });
    },
    validators: {
      onSubmit: formSchema,
    },
  });
  return (
    <div className="grid h-full place-items-center p-2">
      <div>
        <AppTitle />
        <Card className="w-full sm:min-w-lg sm:max-w-lg">
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

            <CardTitle>Enter OTP Code</CardTitle>
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
                      <LoadingSwap
                        isLoading={state.isSubmitting || isVerifyOtpPending}
                      >
                        Verify Code
                      </LoadingSwap>
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
                sendOtp(
                  {},
                  {
                    onSuccess: () => {
                      toast.success("OTP code resent successfully");
                    },
                    onError: (error) => {
                      toast.error(getAuthErrorMessage(error));
                    },
                  }
                );
              }}
              type="button"
              variant="link"
            >
              <LoadingSwap isLoading={isSendOtpPending}>
                Resend Code
              </LoadingSwap>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
