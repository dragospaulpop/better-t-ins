// export here because better-uth schema generation overrides the schema file

import type { AllowedHost } from "@tud-box/db/schema/settings";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { CheckCircleIcon, MoreHorizontal, XCircleIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
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
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { LoadingSwap } from "@/components/ui/loading-swap";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { queryClient, trpc } from "@/lib/trpc";

export const columns: ColumnDef<AllowedHost>[] = [
  {
    id: "left-actions",
    cell: ({ row }) => <AllowedDomainsActions row={row} />,
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
    accessorKey: "host",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Host" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("host") as string;
      return (
        <div className="max-w-40 truncate text-left font-medium">{value}</div>
      );
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("description");
      return <div className="text-left font-medium">{value as string}</div>;
    },
  },
  {
    accessorKey: "enabled",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Enabled" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("enabled");
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
    accessorKey: "addedBy",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Added By" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("addedBy") as string | null;

      if (!value) {
        return <div className="text-center font-medium">n/a</div>;
      }

      return (
        <div className="flex justify-center font-medium">
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar>
                <AvatarImage src={value} />
                <AvatarFallback>{value?.charAt(0) ?? "?"}</AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent className="bg-muted text-muted-foreground">
              {value}
            </TooltipContent>
          </Tooltip>
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
    id: "actions",
    cell: ({ row }) => <AllowedDomainsActions row={row} />,
  },
];

function AllowedDomainsActions({ row }: { row: Row<AllowedHost> }) {
  const allowedHostData = row.original;

  // Add state to control which dialog is open
  const [openDialog, setOpenDialog] = useState<
    "disable" | "enable" | "delete" | "edit" | null
  >(null);

  const updateHostMutation = useMutation(
    trpc.settings.updateHost.mutationOptions()
  );
  const deleteHostMutation = useMutation(
    trpc.settings.deleteHost.mutationOptions()
  );

  const form = useForm({
    defaultValues: {
      description: allowedHostData.description,
    },
    validators: {
      onSubmit: z.object({
        description: z.string().min(1),
      }),
    },
    onSubmit: ({ value }) => {
      handleEdit(value.description);
    },
  });

  async function handleDisable() {
    try {
      await updateHostMutation.mutateAsync({
        host: allowedHostData.host,
        description: allowedHostData.description,
        enabled: false,
      });

      toast.success("Host disabled successfully");

      await queryClient.invalidateQueries({
        queryKey: trpc.settings.getAllowedDomains.queryKey(),
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage);
    }
  }

  async function handleEnable() {
    try {
      await updateHostMutation.mutateAsync({
        host: allowedHostData.host,
        description: allowedHostData.description,
        enabled: true,
      });

      toast.success("Host enabled successfully");

      await queryClient.invalidateQueries({
        queryKey: trpc.settings.getAllowedDomains.queryKey(),
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage);
    }
  }

  async function handleDelete() {
    try {
      await deleteHostMutation.mutateAsync({
        host: allowedHostData.host,
      });

      toast.success("Host deleted successfully");

      await queryClient.invalidateQueries({
        queryKey: trpc.settings.getAllowedDomains.queryKey(),
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage);
    }
  }

  async function handleEdit(description: string) {
    try {
      await updateHostMutation.mutateAsync({
        host: allowedHostData.host,
        description,
        enabled: allowedHostData.enabled,
      });

      toast.success("Host edited successfully");

      await queryClient.invalidateQueries({
        queryKey: trpc.settings.getAllowedDomains.queryKey(),
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage);
    } finally {
      setOpenDialog(null);
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
              navigator.clipboard.writeText(allowedHostData.host);
              toast.success("Host copied to clipboard");
            }}
          >
            Copy host
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setOpenDialog("edit")}>
            Edit host
          </DropdownMenuItem>
          {allowedHostData.enabled ? (
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/20"
              onSelect={() => setOpenDialog("disable")}
            >
              Disable host
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onSelect={() => setOpenDialog("enable")}>
              Enable host
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="text-destructive focus:bg-destructive/20"
            onSelect={() => setOpenDialog("delete")}
          >
            Delete host
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* AlertDialogs rendered OUTSIDE the DropdownMenu */}
      <AlertDialog
        onOpenChange={(open) => !open && setOpenDialog(null)}
        open={openDialog === "disable"}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disable this host?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisable}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        onOpenChange={(open) => !open && setOpenDialog(null)}
        open={openDialog === "enable"}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to enable this host?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEnable}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

      <Dialog
        onOpenChange={(open) => !open && setOpenDialog(null)}
        open={openDialog === "edit"}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit host</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field name="description">
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
                          placeholder="Description"
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
                        isLoading={
                          state.isSubmitting || state.isFieldsValidating
                        }
                      >
                        Save
                      </LoadingSwap>
                    </Button>
                  </DialogFooter>
                )}
              </form.Subscribe>
            </FieldGroup>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
