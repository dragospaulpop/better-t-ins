import { useForm } from "@tanstack/react-form";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { toast } from "sonner";
import z from "zod";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { getAuthErrorCode, getAuthErrorMessage } from "@/lib/auth-error";
import {
  useSendVerificationEmail,
  useSignIn,
  useSignInPasskey,
} from "@/lib/auth-hooks";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../../../../components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../../../../components/ui/input-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../../components/ui/tooltip";
import RecaptchaNotice from "./recaptcha-notice";

const MIN_PASSWORD_LENGTH = 8;

export default function SignInForm({
  onSwitchToSignUp,
  onSwitchToVerifyEmail,
}: {
  onSwitchToSignUp: () => void;
  onSwitchToVerifyEmail: (email: string) => void;
}) {
  const navigate = useNavigate({
    from: "/",
  });
  const { mutateAsync: signIn, isPending: isSignInPending } = useSignIn();
  const {
    mutate: sendVerificationEmail,
    isPending: isSendVerificationEmailPending,
  } = useSendVerificationEmail();
  const { mutate: signInPasskey } = useSignInPasskey();

  const router = useRouter();

  const [isPassWordVisible, setIsPassWordVisible] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const verifyRecaptcha = useCallback(async () => {
    if (!executeRecaptcha) {
      toast.error("Failed to verify reCAPTCHA");
      return null;
    }
    const token = await executeRecaptcha("signin");
    if (!token) {
      toast.error("Failed to verify reCAPTCHA");
      return null;
    }
    return token;
  }, [executeRecaptcha]);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      const token = await verifyRecaptcha();
      if (!token) {
        toast.error("Failed to verify reCAPTCHA");
        return;
      }
      const {error, data} = await signIn(
        {
          email: value.email,
          password: value.password,
          fetchOptions: {
            headers: {
              "x-captcha-response": token,
            },
          },
        },
        {
          onSuccess: ({ data }) => {
            const result = data as {
              emailNotVerified: boolean;
              twoFactorRedirect: boolean;
              email: string;
            };
            console.log(result);
            if (result.emailNotVerified) {
              onSwitchToVerifyEmail(result.email);
            } else if (result.twoFactorRedirect) {
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
              toast.success("Sign in successful", {
                testId: "sign-in-success",
              });
            }
          },
          onError: (error) => {
            const authErrorMessage = getAuthErrorMessage(error);
            const authErrorCode = getAuthErrorCode(error);

            if (authErrorCode === "EMAIL_NOT_VERIFIED") {
              toast.error(
                "Email not verified. Check your email for a verification link.",
                {
                  action: {
                    label: "Resend email",
                    onClick: () => {
                      sendVerificationEmail(
                        {
                          email: value.email,
                          callbackURL: `${window.location.origin}/dashboard`,
                        },
                        {
                          onSuccess: () => {
                            toast.success("Verification email sent");
                          },
                          onError: (emailError) => {
                            toast.error(getAuthErrorMessage(emailError));
                          },
                        }
                      );
                    },
                  },
                }
              );
            } else {
              toast.error(authErrorMessage, {
                testId: "email-error",
              });
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

  useEffect(() => {
    if (!PublicKeyCredential.isConditionalMediationAvailable?.()) {
      toast.error("Conditional mediation is not available");
      return;
    }
    signInPasskey(
      {
        autoFill: true,
      },
      {
        onSuccess: () => {
          router.invalidate();
        },
        onError: (error) => {
          toast.error(getAuthErrorMessage(error));
        },
      }
    );
  }, [signInPasskey, router]);

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>Sign in to your account to continue.</CardDescription>
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
                        autoComplete="email webauthn"
                        autoFocus
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
                    <FieldLabel
                      className="flex items-center justify-between gap-2"
                      htmlFor={field.name}
                    >
                      Password
                      <Link
                        className="text-xs hover:underline"
                        to="/login/password-reset-or-magic-link"
                      >
                        Forgot your password?
                      </Link>
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <LockIcon />
                      </InputGroupAddon>
                      <InputGroupInput
                        autoComplete="current-password webauthn"
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
                              {isPassWordVisible ? <EyeOffIcon /> : <EyeIcon />}
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
                    <LoadingSwap
                      isLoading={
                        state.isSubmitting ||
                        isSignInPending ||
                        isSendVerificationEmailPending
                      }
                    >
                      Sign In
                    </LoadingSwap>
                  </Button>
                </Field>
              )}
            </form.Subscribe>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex-col items-center justify-center">
        <Field orientation="horizontal">
          <FieldLabel htmlFor="sign-up">Need an account? </FieldLabel>
          <Button onClick={onSwitchToSignUp} variant="link">
            Sign Up
          </Button>
        </Field>
        <RecaptchaNotice />
      </CardFooter>
    </Card>
  );
}
