import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  RotateCcwKeyIcon,
  UserIcon,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { toast } from "sonner";
import z from "zod";
import PasswordStrengthTooltip from "@/components/password-strength-tooltip";
import { Progress } from "@/components/ui/progress";
import { authClient } from "@/lib/auth-client";
import generatePassword, {
  isStrongEnough,
  passwordStrength,
} from "@/utils/password-generator";
import Loader from "../../../components/loader";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../../../components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../../../components/ui/input-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../components/ui/tooltip";
import RecaptchaNotice from "./recaptcha-notice";

const MIN_PASSWORD_LENGTH_USER = 8;
const MIN_PASSWORD_LENGTH = 16;
const MAX_PASSWORD_LENGTH = 22;

const PASSWORD_STRENGTH_TO_COLOR = {
  100: "bg-success",
  50: "bg-warning",
  25: "bg-destructive",
  5: "bg-muted-foreground",
};

const formSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email("Invalid email address"),
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH_USER, "Password must be at least 8 characters")
      .refine(
        (password) =>
          isStrongEnough(password, {
            minLength: MIN_PASSWORD_LENGTH_USER,
            uppercaseMinCount: 1,
            lowercaseMinCount: 1,
            numberMinCount: 1,
            specialMinCount: 1,
          }),
        "Password must include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export default function SignUpForm({
  onSwitchToSignIn,
}: {
  onSwitchToSignIn: () => void;
}) {
  const navigate = useNavigate({
    from: "/",
  });
  const { isPending } = authClient.useSession();
  const [isPassWordVisible, setIsPassWordVisible] = useState(false);
  const [passwordStrengthValue, setPasswordStrengthValue] = useState(0);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const generateRandomPassword = () => {
    const randomLength =
      Math.floor(Math.random() * (MAX_PASSWORD_LENGTH - MIN_PASSWORD_LENGTH)) +
      MIN_PASSWORD_LENGTH;

    return generatePassword(randomLength, true);
  };

  const verifyRecaptcha = useCallback(async () => {
    if (!executeRecaptcha) {
      toast.error("Failed to verify reCAPTCHA");
      return null;
    }
    const token = await executeRecaptcha("signup");
    if (!token) {
      toast.error("Failed to verify reCAPTCHA");
      return null;
    }
    return token;
  }, [executeRecaptcha]);

  const form = useForm({
    defaultValues: {
      email: "froind@gmail.com",
      password: "TestTest1!",
      name: "Dragos",
      confirmPassword: "TestTest1!",
    },
    onSubmit: async ({ value }) => {
      const token = await verifyRecaptcha();
      if (!token) {
        toast.error("Failed to verify reCAPTCHA");
        return;
      }
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          headers: {
            "x-captcha-response": token,
          },

          onSuccess: () => {
            authClient.sendVerificationEmail(
              {
                email: value.email,
                callbackURL: `${window.location.origin}/dashboard`,
              },
              {
                onSuccess: () => {
                  navigate({
                    to: "/login",
                  });
                  toast.success(
                    "Sign up successful. Check your email for a verification link."
                  );
                },
                onError: (emailError) => {
                  toast.error(
                    emailError.error.message || emailError.error.statusText
                  );
                },
              }
            );
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

  if (isPending) {
    return <Loader />;
  }

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Create an account to get started.</CardDescription>
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
            <form.Field name="name">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>

                    <InputGroup>
                      <InputGroupInput
                        aria-invalid={isInvalid}
                        autoComplete="off"
                        autoFocus
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Your name"
                        type="text"
                        value={field.state.value}
                      />
                      <InputGroupAddon>
                        <UserIcon />
                      </InputGroupAddon>
                    </InputGroup>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

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
                        autoComplete="off"
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
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        aria-invalid={isInvalid}
                        autoComplete="off"
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          field.handleChange(e.target.value);
                          setPasswordStrengthValue(
                            passwordStrength(e.target.value)
                          );
                        }}
                        placeholder="Your password"
                        type={isPassWordVisible ? "text" : "password"}
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
                                const randomPassword = generateRandomPassword();
                                field.handleChange(randomPassword);
                                setPasswordStrengthValue(
                                  passwordStrength(randomPassword)
                                );
                                form.setFieldValue(
                                  "confirmPassword",
                                  randomPassword
                                );
                              }}
                              size="icon-xs"
                            >
                              <RotateCcwKeyIcon />
                            </InputGroupButton>
                          </TooltipTrigger>
                          <TooltipContent>
                            Generate random password
                          </TooltipContent>
                        </Tooltip>

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
                    <div className="flex items-center gap-2">
                      <Progress
                        indicatorClassName={
                          PASSWORD_STRENGTH_TO_COLOR[
                            passwordStrengthValue as keyof typeof PASSWORD_STRENGTH_TO_COLOR
                          ] || "bg-muted-foreground"
                        }
                        value={passwordStrengthValue}
                      />
                      <PasswordStrengthTooltip />
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
            <form.Field name="confirmPassword">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Confirm Password
                    </FieldLabel>

                    <InputGroup>
                      <InputGroupInput
                        aria-invalid={isInvalid}
                        autoComplete="off"
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Confirm your password"
                        type={isPassWordVisible ? "text" : "password"}
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
                              onClick={() =>
                                setIsPassWordVisible(!isPassWordVisible)
                              }
                              size="icon-xs"
                            >
                              {isPassWordVisible ? <EyeOffIcon /> : <EyeIcon />}
                            </InputGroupButton>
                          </TooltipTrigger>
                          <TooltipContent>
                            This is content in a tooltip.
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
                    {state.isSubmitting ? "Submitting..." : "Sign Up"}
                  </Button>
                </Field>
              )}
            </form.Subscribe>
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="flex-col items-center justify-center">
        <Field orientation="horizontal">
          <FieldLabel htmlFor="sign-in">Already have an account?</FieldLabel>
          <Button onClick={onSwitchToSignIn} variant="link">
            Sign In
          </Button>
        </Field>
        <RecaptchaNotice />
      </CardFooter>
    </Card>
  );
}
