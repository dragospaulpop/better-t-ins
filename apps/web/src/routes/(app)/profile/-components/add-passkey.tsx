import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
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
import { LoadingSwap } from "@/components/ui/loading-swap";
import { useAddPasskey } from "@/lib/auth-hooks";

const addPasskeySchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export default function AddPasskey() {
  const [addPasskeyDialogOpen, setAddPasskeyDialogOpen] = useState(false);
  const { mutate: addPasskey, isPending: isAddPasskeyPending } =
    useAddPasskey();

  const addPasskeyForm = useForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onSubmit: addPasskeySchema,
    },
    onSubmit: ({ value }) => {
      addPasskey(
        { name: value.name },
        {
          onSuccess: () => {
            toast.success("Passkey added successfully");
            setAddPasskeyDialogOpen(false);
            addPasskeyForm.reset();
          },
          onError: (error) => {
            toast.error(error.message);
          },
        }
      );
    },
  });

  return (
    <Dialog onOpenChange={setAddPasskeyDialogOpen} open={addPasskeyDialogOpen}>
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
                  variant="default"
                >
                  <LoadingSwap
                    isLoading={isAddPasskeyPending || state.isSubmitting}
                  >
                    Add Passkey
                  </LoadingSwap>
                </Button>
              )}
            </addPasskeyForm.Subscribe>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
