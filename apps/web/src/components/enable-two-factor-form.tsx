import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Loader, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import z from "zod";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const MIN_PASSWORD_LENGTH = 1;

export default function EnableTwoFactorForm() {
  const navigate = useNavigate({
    from: "/profile/enable-two-factor",
  });
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.twoFactor.enable(
        {
          password: value.password,
          issuer: "VerdeINS",
        },
        {
          onSuccess: ({ data }) => {
            navigate({
              to: "/profile/confirm-totp/$totpURI/$backupCodes",
              params: {
                totpURI: data.totpURI,
                backupCodes: data.backupCodes,
              },
            });
            toast.success(
              "Two-Factor Authentication process started successfully"
            );
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        }
      );
    },
    validators: {
      onSubmit: z.object({
        password: z
          .string()
          .min(MIN_PASSWORD_LENGTH, "Password can't be empty"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-md p-6">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div>
          <form.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Password</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="password"
                  value={field.state.value}
                />

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
                "Enable Two-Factor Authentication"
              )}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
}
