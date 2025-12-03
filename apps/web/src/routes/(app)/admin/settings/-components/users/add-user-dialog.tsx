import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { TRPCClientError } from "@trpc/client";
import {
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  FolderPlusIcon,
  LockIcon,
  RotateCcwKeyIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import PasswordStrengthTooltip from "@/components/password-strength-tooltip";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCreateUser } from "@/lib/auth-hooks";
import generatePassword, {
  isStrongEnough,
  passwordStrength,
} from "@/lib/password-generator";

const MIN_PASSWORD_LENGTH_USER = 8;
const MIN_PASSWORD_LENGTH = 16;
const MAX_PASSWORD_LENGTH = 22;

const PASSWORD_STRENGTH_TO_COLOR = {
  100: "bg-success",
  50: "bg-warning",
  25: "bg-destructive",
  5: "bg-muted-foreground",
};

const schema = z
  .object({
    name: z.string().min(1, "Name is required"),
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

const routeApi = getRouteApi("/(app)/admin/settings/");

export default function AddUserDialog() {
  const [open, setOpen] = useState(false);
  const { trpc } = routeApi.useRouteContext();

  const [isPassWordVisible, setIsPassWordVisible] = useState(false);
  const [passwordStrengthValue, setPasswordStrengthValue] = useState(0);

  const generateRandomPassword = () => {
    const randomLength =
      Math.floor(Math.random() * (MAX_PASSWORD_LENGTH - MIN_PASSWORD_LENGTH)) +
      MIN_PASSWORD_LENGTH;

    return generatePassword(randomLength, true);
  };

  const createMutation = useCreateUser();

  const validateMutation = useMutation(
    trpc.users.validateEmail.mutationOptions()
  );

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onSubmit: schema,
      onSubmitAsync: async ({ value }) => {
        try {
          await createMutation.mutateAsync({
            ...value,
          });
          toast.success("User created successfully");
          // auth-hook takes care of invalidating the list-users query
          // await queryClient.invalidateQueries({
          //   queryKey: ["list-users"],
          // });
          form.reset();
          setPasswordStrengthValue(0);
          setIsPassWordVisible(false);
          setOpen(false);
          return null;
        } catch (e) {
          const error = handleCreateUserError(e);
          return {
            fields: {
              email: { message: error },
            },
          };
        }
      },
    },
  });

  return (
    <Dialog
      onOpenChange={(v) => {
        if (!v) {
          form.reset();
        }
        setOpen(v);
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <FolderPlusIcon className="h-4 w-4" />
          Add user
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add user</DialogTitle>
          <DialogDescription>
            Add a new user to the application
          </DialogDescription>
        </DialogHeader>
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
                        autoFocus
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Name"
                        type="text"
                        value={field.state.value}
                      />
                    </InputGroup>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field
              name="email"
              validators={{
                onDynamicAsyncDebounceMs: 500,
                onDynamicAsync: async ({ value }) => {
                  if (!value) {
                    return { message: "Email can't be empty" };
                  }

                  try {
                    const emailExists = await validateMutation.mutateAsync({
                      email: value,
                    });

                    return emailExists
                      ? { message: "Email already exists" }
                      : undefined;
                  } catch (e) {
                    return {
                      message: handleCreateUserError(e),
                    };
                  }
                },
              }}
            >
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        aria-invalid={isInvalid}
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Email"
                        type="text"
                        value={field.state.value}
                      />
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
                        placeholder="Password"
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
                          <TooltipContent className="bg-muted text-muted-foreground">
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
                          <TooltipContent className="bg-muted text-muted-foreground">
                            Toggle password visibility
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InputGroupButton
                              className="rounded-full"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  field.state.value
                                );
                                toast.success("Password copied to clipboard");
                              }}
                              size="icon-xs"
                            >
                              <CopyIcon />
                            </InputGroupButton>
                          </TooltipTrigger>
                          <TooltipContent className="bg-muted text-muted-foreground">
                            Copy password to clipboard
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
                        placeholder="Confirm password"
                        type={isPassWordVisible ? "text" : "password"}
                        value={field.state.value}
                      />
                      <InputGroupAddon>
                        <LockIcon />
                      </InputGroupAddon>
                      <InputGroupAddon align="inline-end">
                        <Tooltip open={true}>
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
                          <TooltipContent className="bg-muted text-muted-foreground">
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
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>

                  <Button
                    disabled={!state.canSubmit || state.isSubmitting}
                    type="submit"
                  >
                    <LoadingSwap
                      isLoading={state.isSubmitting || state.isFieldsValidating}
                    >
                      Add user
                    </LoadingSwap>
                  </Button>
                </DialogFooter>
              )}
            </form.Subscribe>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function handleCreateUserError(e: unknown): string {
  if (e instanceof TRPCClientError) {
    if (e.data?.code === "UNAUTHORIZED") {
      return "You are not authorized to create a user";
    }
    if (e.data?.code === "BAD_REQUEST") {
      try {
        const error = JSON.parse(e.message as string) as {
          code: string;
          message: string;
          path: string[];
        }[];

        return (
          error?.[0]?.message ??
          "Failed to create user (no server error message)"
        );
      } catch (_) {
        return "Failed to create user (unknown error)";
      }
    }

    if (e.data?.code === "INTERNAL_SERVER_ERROR") {
      return e.message;
    }
    return `Failed to create user (${e.data?.code} ${e.data?.message})`;
  }
  return `Failed to create user (unknown error: ${(e as Error)?.message})`;
}
