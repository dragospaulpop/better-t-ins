import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { TRPCClientError } from "@trpc/client";
import { FolderPlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
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
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { Switch } from "@/components/ui/switch";

const schema = z.object({
  host: z.string().min(1).regex(z.regexes.domain, "Invalid host name"),
  description: z.string().min(1),
  enabled: z.boolean(),
});

const routeApi = getRouteApi("/(app)/admin/settings/");

export default function AddDomainDialog() {
  const [open, setOpen] = useState(false);
  const { trpc, queryClient } = routeApi.useRouteContext();

  const createMutation = useMutation(trpc.settings.create.mutationOptions());
  const validateMutation = useMutation(
    trpc.settings.validateHostName.mutationOptions()
  );

  const form = useForm({
    defaultValues: {
      host: "",
      description: "",
      enabled: true,
    },
    validationLogic: revalidateLogic(),
    validators: {
      onSubmit: schema,
      onSubmitAsync: async ({ value }) => {
        try {
          await createMutation.mutateAsync({
            ...value,
          });
          toast.success("Host created successfully");
          await queryClient.invalidateQueries({
            queryKey: trpc.settings.getAllowedDomains.queryKey(),
          });
          form.reset();
          setOpen(false);
          return null;
        } catch (e) {
          const error = handleCreateHostError(e);
          return {
            fields: {
              host: { message: error },
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
          Add host
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add host</DialogTitle>
          <DialogDescription>
            Add a new host to the allowed domains list
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
            <form.Field
              name="host"
              validators={{
                onDynamicAsyncDebounceMs: 500,
                onDynamicAsync: async ({ value }) => {
                  if (!value) {
                    return { message: "Host can't be empty" };
                  }

                  try {
                    const hostExists = await validateMutation.mutateAsync({
                      host: value,
                    });

                    return hostExists
                      ? { message: "Host already exists" }
                      : undefined;
                  } catch (e) {
                    return {
                      message: handleCreateHostError(e),
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
                    <FieldLabel htmlFor={field.name}>Host</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        aria-invalid={isInvalid}
                        autoFocus
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Host name"
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

            <form.Field name="enabled">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid} orientation="horizontal">
                    <Switch
                      checked={field.state.value}
                      id={field.name}
                      name={field.name}
                      onCheckedChange={(value) =>
                        field.handleChange(value as boolean)
                      }
                    />
                    <FieldLabel htmlFor={field.name}>Enabled</FieldLabel>
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
                      Add host
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

function handleCreateHostError(e: unknown): string {
  if (e instanceof TRPCClientError) {
    if (e.data?.code === "UNAUTHORIZED") {
      return "You are not authorized to create a host";
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
          "Failed to create host (no server error message)"
        );
      } catch (_) {
        return "Failed to create host (unknown error)";
      }
    }

    if (e.data?.code === "INTERNAL_SERVER_ERROR") {
      return e.message;
    }
    return `Failed to create host (${e.data?.code} ${e.data?.message})`;
  }
  return `Failed to create host (unknown error: ${(e as Error)?.message})`;
}
