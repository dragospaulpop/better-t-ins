// export here because better-uth schema generation overrides the schema file

import type { user } from "@better-t-ins/db/schema/auth";
import type { ColumnDef } from "@tanstack/react-table";
import type { UserWithRole } from "better-auth/plugins";
import {
  CheckCircleIcon,
  MoreHorizontal,
  OctagonMinusIcon,
  ShieldCheckIcon,
  UserIcon,
  XCircleIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRemoveUser } from "@/lib/auth-hooks";
export type User = UserWithRole &
  (typeof user.$inferSelect)["twoFactorEnabled"];

export const columns: ColumnDef<User>[] = [
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
                    {bannedReason} lorem ipsum dolor sit amet consectetur
                    adipisicing elit. Quisquam, quos.
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
    cell: ({ row }) => {
      // Add state to control which dialog is open
      const [openDialog, setOpenDialog] = useState<
        "ban" | "unban" | "delete" | "edit" | null
      >(null);
      const userData = row.original;

      const deleteUserMutation = useRemoveUser();

      async function handleDelete() {
        try {
          await deleteUserMutation.mutateAsync({
            userId: userData.id,
          });

          toast.success("User deleted successfully");
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "An unknown error occurred";
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
                <DropdownMenuItem>Unban user</DropdownMenuItem>
              ) : (
                <DropdownMenuItem>Ban user</DropdownMenuItem>
              )}

              <DropdownMenuItem
                className="text-destructive focus:bg-destructive/20"
                onSelect={() => setOpenDialog("delete")}
              >
                Delete user
              </DropdownMenuItem>
              <DropdownMenuItem>Change user role</DropdownMenuItem>
              <DropdownMenuItem>Change user password</DropdownMenuItem>
              <DropdownMenuItem>Change user name</DropdownMenuItem>
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
                <AlertDialogAction onClick={handleDelete}>
                  Yes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      );
    },
  },
];
