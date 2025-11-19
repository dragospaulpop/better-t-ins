import { useForm } from "@tanstack/react-form";
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { CheckCircleIcon, TrashIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import ErrorComponent from "@/components/error";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";
import ShowBackupCodes from "@/routes/(auth)/login/-components/show-backup-codes";

export const Route = createFileRoute("/(app)/profile/")({
  component: RouteComponent,
  beforeLoad: async () => {
    const { data: passkeys, error: passkeyError } =
      await authClient.passkey.listUserPasskeys();
    return { passkeys, passkeyError };
  },
});

const addPasskeySchema = z.object({
  name: z.string().min(1, "Name is required"),
});

function RouteComponent() {
  const { session, passkeys, passkeyError } = Route.useRouteContext();
  const navigate = useNavigate();
  const [addPasskeyDialogOpen, setAddPasskeyDialogOpen] = useState(false);
  const router = useRouter();

  const addPasskeyForm = useForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onSubmit: addPasskeySchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.passkey.addPasskey(
        { name: value.name },
        {
          onSuccess: () => {
            toast.success("Passkey added successfully");
            setAddPasskeyDialogOpen(false);
            addPasskeyForm.reset();
            router.invalidate();
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        }
      );
    },
  });

  return (
    <div className="grid place-items-start p-2">
      <Card className="mx-auto w-full sm:max-w-2xl">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Item>
            <ItemMedia>
              <Avatar className="size-16">
                <AvatarImage
                  className="grayscale"
                  src={session.data?.user.image ?? undefined}
                />

                <AvatarFallback>
                  {session.data?.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{session.data?.user.name}</ItemTitle>
              <ItemDescription>
                <span className="font-medium leading-none">
                  {session.data?.user.email}
                </span>
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Tooltip>
                <TooltipTrigger asChild>
                  {session.data?.user.emailVerified ? (
                    <CheckCircleIcon className="size-8 text-success" />
                  ) : (
                    <XIcon className="size-8 text-destructive" />
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  {session.data?.user.emailVerified
                    ? "Email verified"
                    : "Email not verified"}
                </TooltipContent>
              </Tooltip>
            </ItemActions>
          </Item>

          {session.data?.user.twoFactorEnabled ? <ShowBackupCodes /> : null}
        </CardContent>
        {passkeyError ? (
          <ErrorComponent
            element="div"
            error={{
              message: passkeyError.message || "An unknown error occurred",
            }}
          />
        ) : null}
        {passkeys ? (
          <div className="flex flex-col gap-2">
            {passkeys.map((passkey) => (
              <Item key={passkey.id}>
                <ItemContent>
                  <ItemTitle>{passkey.name}</ItemTitle>
                  <ItemDescription>{passkey.id}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button
                    onClick={() => {
                      authClient.passkey.deletePasskey(
                        { id: passkey.id },
                        {
                          onSuccess: () => {
                            toast.success("Passkey deleted successfully");
                            router.invalidate();
                          },
                          onError: (error) => {
                            toast.error(
                              error.error.message || error.error.statusText
                            );
                          },
                        }
                      );
                    }}
                    size="icon"
                    variant="destructive"
                  >
                    <TrashIcon className="size-4" />
                  </Button>
                </ItemActions>
              </Item>
            ))}
          </div>
        ) : null}
        <CardFooter className="flex justify-center">
          <Field
            className="w-full flex-wrap justify-center"
            orientation="horizontal"
          >
            {session.data?.user.twoFactorEnabled ? (
              <Button variant="destructive">Disable 2FA</Button>
            ) : (
              <Button
                onClick={() => {
                  navigate({
                    to: "/profile/enable-two-factor",
                  });
                }}
              >
                Enable 2FA
              </Button>
            )}

            {session.data?.user && (
              <Button
                onClick={async () => {
                  await authClient.deleteUser({
                    callbackURL: `${window.location.origin}/goodbye`,
                    fetchOptions: {
                      onSuccess: () => {
                        toast.success(
                          "Account deletion process started. Check your email for a verification link."
                        );
                      },
                      onError: (deleteUserError) => {
                        toast.error(
                          deleteUserError.error.message ||
                            deleteUserError.error.statusText
                        );
                        window.location.reload();
                      },
                    },
                  });
                }}
                variant="destructive"
              >
                Delete Account
              </Button>
            )}
            {session.data?.user && (
              <Button
                onClick={() => {
                  navigate({
                    to: "/profile/change-password",
                  });
                }}
                variant="outline"
              >
                Change Password
              </Button>
            )}
            <Dialog
              onOpenChange={setAddPasskeyDialogOpen}
              open={addPasskeyDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline">Add Passkey</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Passkey</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addPasskeyForm.handleSubmit();
                  }}
                >
                  <FieldGroup className="">
                    <addPasskeyForm.Field name="name">
                      {(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid;
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
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                                placeholder="Passkey name"
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
                    </addPasskeyForm.Field>
                    <addPasskeyForm.Subscribe>
                      {(state) => (
                        <Button
                          disabled={!state.canSubmit || state.isSubmitting}
                          onClick={async () => {
                            await addPasskeyForm.handleSubmit();
                          }}
                          type="submit"
                          variant="default"
                        >
                          {state.isSubmitting ? "Adding..." : "Add Passkey"}
                        </Button>
                      )}
                    </addPasskeyForm.Subscribe>
                  </FieldGroup>
                </form>
              </DialogContent>
            </Dialog>
          </Field>
        </CardFooter>
      </Card>
    </div>
  );
}
