import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { EyeIcon, Loader, LockIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { getAuthErrorMessage } from "@/lib/auth-error";
import { useEnable2FA, useSession } from "@/lib/auth-hooks";

const MIN_PASSWORD_LENGTH = 1;

export default function EnableTwoFactorForm() {
  const { mutate: enable2FA, isPending: isEnable2FAPending } = useEnable2FA();
  const navigate = useNavigate({
    from: "/profile/enable-two-factor",
  });
  const { isPending } = useSession();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const form = useForm({
    defaultValues: {
      password: "",
    },
    onSubmit: ({ value }) => {
      enable2FA(
        {
          password: value.password,
          issuer: "VerdeINS",
        },
        {
          onSuccess: (data) => {
            const response = data as { totpURI: string; backupCodes: string };
            navigate({
              to: "/profile/confirm-totp/$totpURI/$backupCodes",
              params: {
                totpURI: response.totpURI,
                backupCodes: response.backupCodes,
              },
            });
            toast.success(
              "Two-Factor Authentication process started successfully"
            );
          },
          onError: (error) => {
            toast.error(getAuthErrorMessage(error));
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
    <div>
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
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Password</Label>
                  <InputGroup>
                    <InputGroupInput
                      aria-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
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
                            onClick={() => {
                              setIsPasswordVisible(!isPasswordVisible);
                            }}
                            size="icon-xs"
                          >
                            <EyeIcon />
                          </InputGroupButton>
                        </TooltipTrigger>
                      </Tooltip>
                    </InputGroupAddon>
                  </InputGroup>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </div>
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
                  <LoadingSwap
                    isLoading={state.isSubmitting || isEnable2FAPending}
                  >
                    Enable Two-Factor Authentication
                  </LoadingSwap>
                </Button>
              </Field>
            )}
          </form.Subscribe>
        </FieldGroup>
      </form>
    </div>
  );
}
