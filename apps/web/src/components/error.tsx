import type { AppRouter } from "@better-t-ins/api/routers/index";
import type { TRPCClientErrorLike } from "@trpc/client";
import { CircleXIcon } from "lucide-react";

export default function ErrorComponent({
  error,
}: {
  error: TRPCClientErrorLike<AppRouter>;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 pt-8">
      <CircleXIcon className="size-10 text-red-500" />
      <p>{error.message ?? "An unknown error occurred"}</p>
    </div>
  );
}
