import { TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { ActionButton } from "@/components/ui/action-button";
import { useDeletePasskey } from "@/lib/auth-hooks";

export default function DeletePasskey({ id }: { id: string }) {
  const { mutate: deletePasskey } = useDeletePasskey();
  return (
    <ActionButton
      action={async () =>
        new Promise((resolve, reject) => {
          deletePasskey(
            { id },
            {
              onSuccess: () => {
                toast.success("Passkey deleted successfully");
                resolve({ error: false });
              },
              onError: (error) => {
                toast.error("Failed to delete passkey", {
                  description: error.message,
                });
                reject(error.message);
              },
            }
          );
        })
      }
      areYouSureDescription="Are you sure you want to delete this passkey?"
      requireAreYouSure
      variant="destructive"
    >
      <TrashIcon className="size-4" />
    </ActionButton>
  );
}
