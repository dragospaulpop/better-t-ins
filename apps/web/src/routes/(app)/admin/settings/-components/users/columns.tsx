// export here because better-uth schema generation overrides the schema file

import type { user } from "@better-t-ins/db/schema/auth";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef, Row } from "@tanstack/react-table";
import type { UserWithRole } from "better-auth/plugins";
import {
  CalendarIcon,
  CheckCircleIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MoreHorizontal,
  OctagonMinusIcon,
  RotateCcwKeyIcon,
  ShieldCheckIcon,
  UserIcon,
  XCircleIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import PasswordStrengthTooltip from "@/components/password-strength-tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { LoadingSwap } from "@/components/ui/loading-swap";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useBanUser,
  useImpersonateUser,
  useRemoveUser,
  useSession,
  useSetUserPassword,
  useSetUserRole,
  useUnbanUser,
} from "@/lib/auth-hooks";
import generatePassword, {
  isStrongEnough,
  passwordStrength,
} from "@/lib/password-generator";
export type User = UserWithRole &
  (typeof user.$inferSelect)["twoFactorEnabled"];

const SECONDS_IN_DAY = 24 * 60 * 60;
const MILLISECONDS_IN_SECOND = 1000;

const MIN_PASSWORD_LENGTH_USER = 8;
const MIN_PASSWORD_LENGTH = 16;
const MAX_PASSWORD_LENGTH = 22;

const PASSWORD_STRENGTH_TO_COLOR = {
  100: "bg-success",
  50: "bg-warning",
  25: "bg-destructive",
  5: "bg-muted-foreground",
};

export const columns: ColumnDef<User>[] = [
  {
    id: "left-actions",
    cell: ({ row }) => <UserActions row={row} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      const value = row.getValue("id") as string;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="max-w-20 truncate text-left font-medium">
              {value}
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-muted text-muted-foreground">
            {value}
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("name") as string;
      return (
        <div className="max-w-40 truncate text-left font-medium">{value}</div>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("email");
      return (
        <div className="text-left font-medium">
          <a href={`mailto:${value as string}`}>{value as string}</a>
        </div>
      );
    },
  },
  {
    accessorKey: "emailVerified",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Verified" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("emailVerified");
      return (
        <div className="flex justify-center font-medium">
          {value ? (
            <CheckCircleIcon className="size-4 text-green-500" />
          ) : (
            <XCircleIcon className="size-4 text-red-500" />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const value = row.getValue("image");
      const name = row.getValue("name") as string;
      return (
        <div className="flex justify-center font-medium">
          <Avatar>
            <AvatarImage src={value as string} />
            <AvatarFallback>{name?.charAt(0) ?? "?"}</AvatarFallback>
          </Avatar>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      const value = Date.parse(row.getValue("createdAt"));
      const formatted = new Date(value).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      return <div className="text-left font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated At" />
    ),
    cell: ({ row }) => {
      const value = Date.parse(row.getValue("updatedAt"));
      const formatted = new Date(value).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      return <div className="text-left font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "twoFactorEnabled",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="2FA" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("twoFactorEnabled");

      return (
        <div className="flex justify-center font-medium">
          {value ? (
            <CheckCircleIcon className="size-4 text-green-500" />
          ) : (
            <XCircleIcon className="size-4 text-red-500" />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("role");
      return (
        <div className="flex justify-center font-medium">
          {value === "admin" ? (
            <ShieldCheckIcon className="size-4 text-tud-blue" />
          ) : (
            <UserIcon className="size-4 text-tud-green" />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "banned",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Active" />
    ),
    cell: ({ row }) => {
      const userData = row.original;
      const value = row.getValue("banned") as boolean;
      const bannedReason = userData.banReason;
      const banExpires = userData.banExpires;
      const formattedBanExpires = banExpires
        ? new Date(banExpires).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })
        : null;

      return value ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex justify-center font-medium">
              <OctagonMinusIcon className="size-4 text-red-500" />
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-muted text-muted-foreground">
            <div className="flex max-w-48 flex-col gap-0">
              <Item size="sm">
                <ItemContent>
                  <ItemTitle className="text-destructive">Banned</ItemTitle>
                  <ItemDescription className="line-clamp-none text-xs">
                    {bannedReason}
                  </ItemDescription>
                </ItemContent>
              </Item>

              <Item size="sm">
                <ItemContent>
                  <ItemTitle className="text-warning">Ban expires on</ItemTitle>
                  <ItemDescription className="text-xs">
                    {formattedBanExpires}
                  </ItemDescription>
                </ItemContent>
              </Item>
            </div>
          </TooltipContent>
        </Tooltip>
      ) : (
        <div className="flex justify-center font-medium">
          <CheckCircleIcon className="size-4 text-green-500" />
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <UserActions row={row} />,
  },
];

function UserActions({ row }: { row: Row<User> }) {
  const userData = row.original;
  const { data: session } = useSession();
  const navigate = useNavigate();
  // Add state to control which dialog is open
  const [openDialog, setOpenDialog] = useState<
    | "ban"
    | "unban"
    | "delete"
    | "setUserRole"
    | "setUserPassword"
    | "impersonate"
    | null
  >(null);

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(
    new Date()
  );

  const queryClient = useQueryClient();

  const deleteUserMutation = useRemoveUser();
  const banUserMutation = useBanUser();
  const unbanUserMutation = useUnbanUser();
  const setUserRoleMutation = useSetUserRole();
  const setUserPasswordMutation = useSetUserPassword();
  const impersonateUserMutation = useImpersonateUser();

  const [isPassWordVisible, setIsPassWordVisible] = useState(false);
  const [passwordStrengthValue, setPasswordStrengthValue] = useState(0);

  const generateRandomPassword = () => {
    const randomLength =
      Math.floor(Math.random() * (MAX_PASSWORD_LENGTH - MIN_PASSWORD_LENGTH)) +
      MIN_PASSWORD_LENGTH;

    return generatePassword(randomLength, true);
  };

  const banForm = useForm({
    defaultValues: {
      banReason: "",
      banExpiresIn: undefined as Date | undefined,
    },
    validators: {
      onSubmit: z.object({
        banReason: z.string().min(1),
        banExpiresIn: z
          .date()
          .refine((date) => date > new Date(), {
            message: "Date must be in the future",
          })
          .or(z.undefined()),
      }),
    },
    onSubmit: ({ value }) => {
      // selectedDate is always 00:00:00 of the day
      const daysUntilBanExpires = selectedDate
        ? Math.ceil(
            (selectedDate?.getTime() - Date.now()) /
              (SECONDS_IN_DAY * MILLISECONDS_IN_SECOND)
          )
        : undefined;

      handleBan(
        value.banReason,
        daysUntilBanExpires ? daysUntilBanExpires * SECONDS_IN_DAY : undefined
      );
    },
  });

  const setUserPasswordForm = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: z.object({
        password: z
          .string()
          .min(
            MIN_PASSWORD_LENGTH_USER,
            "Password must be at least 8 characters"
          )
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
      }),
    },
    onSubmit: ({ value }) => {
      handleSetUserPassword(value.password);
    },
  });

  async function handleSetUserRole() {
    try {
      await setUserRoleMutation.mutateAsync({
        userId: userData.id,
        role: userData.role === "admin" ? "user" : "admin",
      });
      toast.success("User role changed successfully");
      setOpenDialog(null);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage);
    }
  }

  async function handleBan(
    banReason: string,
    banExpiresIn: number | undefined
  ) {
    try {
      await banUserMutation.mutateAsync({
        userId: userData.id,
        banReason,
        banExpiresIn,
      });
      banForm.reset();
      setSelectedDate(undefined);
      setSelectedMonth(new Date());
      toast.success("User banned successfully");
      setOpenDialog(null);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage);
    }
  }

  async function handleSetUserPassword(newPassword: string) {
    try {
      await setUserPasswordMutation.mutateAsync({
        userId: userData.id,
        newPassword,
      });
      toast.success("User password changed successfully");
      setOpenDialog(null);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage);
    }
  }

  async function handleUnban() {
    try {
      await unbanUserMutation.mutateAsync({
        userId: userData.id,
      });
      toast.success("User unbanned successfully");
      setOpenDialog(null);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage);
    }
  }

  async function handleDelete() {
    try {
      await deleteUserMutation.mutateAsync({
        userId: userData.id,
      });

      toast.success("User deleted successfully");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage);
    }
  }

  async function handleImpersonate() {
    try {
      await impersonateUserMutation.mutateAsync({
        userId: userData.id,
      });
      toast.success("User impersonated successfully");
      setOpenDialog(null);
      queryClient.clear();
      navigate({ to: "/files/{-$parentId}" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="h-8 w-8 p-0" variant="ghost">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(userData.id);
              toast.success("User ID copied to clipboard");
            }}
          >
            Copy user ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {userData.banned ? (
            <DropdownMenuItem onSelect={() => setOpenDialog("unban")}>
              Unban user
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              disabled={session?.user?.id === userData.id}
              onSelect={() => setOpenDialog("ban")}
            >
              Ban user
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            disabled={session?.user?.id === userData.id}
            onSelect={() => setOpenDialog("setUserRole")}
          >
            Change user role
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setOpenDialog("setUserPassword")}>
            Change user password
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:bg-destructive/20"
            disabled={session?.user?.id === userData.id}
            onSelect={() => setOpenDialog("delete")}
          >
            Delete user
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={session?.user?.id === userData.id}
            onSelect={() => setOpenDialog("impersonate")}
          >
            Impersonate user
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        onOpenChange={(open) => !open && setOpenDialog(null)}
        open={openDialog === "delete"}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this host?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        onOpenChange={(open) => !open && setOpenDialog(null)}
        open={openDialog === "unban"}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unban this user?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnban}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        onOpenChange={(open) => !open && setOpenDialog(null)}
        open={openDialog === "setUserRole"}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the role of this user to{" "}
              <strong>{userData.role === "admin" ? "user" : "admin"}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSetUserRole}>
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        onOpenChange={(open) => !open && setOpenDialog(null)}
        open={openDialog === "ban"}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit host</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              banForm.handleSubmit();
            }}
          >
            <FieldGroup>
              <banForm.Field name="banReason">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          aria-invalid={isInvalid}
                          autoFocus
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Reason"
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
              </banForm.Field>
              <banForm.Field name="banExpiresIn">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Ban expires in
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          className="bg-background pr-10"
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) => {
                            const localDate = new Date(e.target.value);
                            if (isValidDate(localDate)) {
                              setSelectedDate(localDate);
                              setSelectedMonth(localDate);
                            }
                            field.handleChange(localDate);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "ArrowDown") {
                              e.preventDefault();
                              setDatePickerOpen(true);
                            }
                          }}
                          placeholder="Select a date"
                          value={formatDate(field.state.value)}
                        />
                        <Popover
                          onOpenChange={setDatePickerOpen}
                          open={datePickerOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              className="-translate-y-1/2 absolute top-1/2 right-2 size-6"
                              id="date-picker"
                              variant="ghost"
                            >
                              <CalendarIcon className="size-3.5" />
                              <span className="sr-only">Select date</span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            align="end"
                            alignOffset={-8}
                            className="w-auto overflow-hidden p-0"
                            sideOffset={10}
                          >
                            <Calendar
                              captionLayout="dropdown"
                              mode="single"
                              month={selectedMonth}
                              onMonthChange={setSelectedMonth}
                              onSelect={(newSelectedDate) => {
                                setSelectedDate(newSelectedDate);
                                field.handleChange(newSelectedDate);
                                setDatePickerOpen(false);
                              }}
                              selected={selectedDate}
                            />
                          </PopoverContent>
                        </Popover>
                      </InputGroup>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </banForm.Field>
              <banForm.Subscribe>
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
                        isLoading={
                          state.isSubmitting || state.isFieldsValidating
                        }
                      >
                        Ban user
                      </LoadingSwap>
                    </Button>
                  </DialogFooter>
                )}
              </banForm.Subscribe>
            </FieldGroup>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        onOpenChange={(open) => !open && setOpenDialog(null)}
        open={openDialog === "setUserPassword"}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change user password</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setUserPasswordForm.handleSubmit();
            }}
          >
            <FieldGroup>
              <setUserPasswordForm.Field name="password">
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
                                  const randomPassword =
                                    generateRandomPassword();
                                  field.handleChange(randomPassword);
                                  setPasswordStrengthValue(
                                    passwordStrength(randomPassword)
                                  );
                                  setUserPasswordForm.setFieldValue(
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
                                {isPassWordVisible ? (
                                  <EyeOffIcon />
                                ) : (
                                  <EyeIcon />
                                )}
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
              </setUserPasswordForm.Field>
              <setUserPasswordForm.Field name="confirmPassword">
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
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InputGroupButton
                                className="rounded-full"
                                onClick={() =>
                                  setIsPassWordVisible(!isPassWordVisible)
                                }
                                size="icon-xs"
                              >
                                {isPassWordVisible ? (
                                  <EyeOffIcon />
                                ) : (
                                  <EyeIcon />
                                )}
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
              </setUserPasswordForm.Field>
              <setUserPasswordForm.Subscribe>
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
                        isLoading={
                          state.isSubmitting || state.isFieldsValidating
                        }
                      >
                        Change password
                      </LoadingSwap>
                    </Button>
                  </DialogFooter>
                )}
              </setUserPasswordForm.Subscribe>
            </FieldGroup>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        onOpenChange={(open) => !open && setOpenDialog(null)}
        open={openDialog === "impersonate"}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Impersonate user</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to impersonate this user?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleImpersonate}>
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !Number.isNaN(date.getTime());
}
