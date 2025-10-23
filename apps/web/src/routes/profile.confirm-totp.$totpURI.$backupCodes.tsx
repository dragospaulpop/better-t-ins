import { useForm } from "@tanstack/react-form";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Loader2Icon } from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
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
  },
});
function RouteComponent() {
  const { totpURI, backupCodes } = Route.useParams();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      code: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.twoFactor.verifyTotp(
        {
          code: value.code,
          trustDevice: true,
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
      }),
    },
  });

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <p className="text-muted-foreground text-sm">
        Scan the QR code with your authenticator app
      </p>
      <QRCode value={totpURI} />
      <div className="flex flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground text-sm">
          Enter the code from your authenticator app
        </p>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div>
            <form.Field name="code">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Code</Label>

                  <InputOTP
                    id={field.name}
                    maxLength={6}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(value) => field.handleChange(value)}
                    pattern={REGEXP_ONLY_DIGITS}
                    value={field.state.value}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>

                  {field.state.meta.errors.map((error) => (
                    <p className="text-red-500" key={error?.message}>
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>
          </div>

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
        </form>

        <div className="flex flex-col items-center justify-center gap-2">
          <p className="text-muted-foreground text-sm">Backup Codes</p>
          {backupCodes.split(",").map((code) => (
            <p className="text-accent-foreground text-xs" key={code}>
              {code}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
