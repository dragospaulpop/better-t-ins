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
import { DataTableColumnHeader } from "@/components/data-table-column-header";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
          <TooltipContent>{value}</TooltipContent>
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
        <div className="text-center font-medium">
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
        <div className="text-center font-medium">
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
      <DataTableColumnHeader column={column} title="2FA Enabled" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("twoFactorEnabled");

      return (
        <div className="text-center font-medium">
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
        <div className="text-center font-medium">
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
      <DataTableColumnHeader column={column} title="Banned" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("banned") as boolean;

      return (
        <div className="text-center font-medium">
          {value ? (
            <OctagonMinusIcon className="size-4 text-red-500" />
          ) : (
            <CheckCircleIcon className="size-4 text-green-500" />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "banReason",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ban Reason" />
    ),
    cell: ({ row }) => {
      const banned = row.getValue("banned") as boolean;
      const value = row.getValue("banReason") as string;

      if (!value && banned) {
        return <div className="text-left font-medium">N/A</div>;
      }
      if (!banned) {
        return <div className="text-left font-medium" />;
      }
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="max-w-20 truncate text-left font-medium">
              {value}
            </div>
          </TooltipTrigger>
          <TooltipContent>{value}</TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: "banExpires",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ban Expires" />
    ),
    cell: ({ row }) => {
      const banned = row.getValue("banned") as boolean;
      const value = row.getValue("banExpires") as string;
      if (!value && banned) {
        return <div className="text-left font-medium">N/A</div>;
      }
      if (!banned) {
        return <div className="text-left font-medium" />;
      }
      return (
        <div className="text-left font-medium">
          {new Date(value).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const userData = row.original;

      return (
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
              onClick={() => navigator.clipboard.writeText(userData.id)}
            >
              Copy user ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {userData.banned ? (
              <DropdownMenuItem>Unban user</DropdownMenuItem>
            ) : (
              <DropdownMenuItem>Ban user</DropdownMenuItem>
            )}

            <DropdownMenuItem>Delete user</DropdownMenuItem>
            <DropdownMenuItem>Change user role</DropdownMenuItem>
            <DropdownMenuItem>Change user password</DropdownMenuItem>
            <DropdownMenuItem>Change user name</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
