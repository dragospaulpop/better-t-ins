import type { AppRouter } from "@better-t-ins/api/routers/index";
import type { TRPCClientErrorLike } from "@trpc/client";
import { CircleXIcon } from "lucide-react";

type ErrorLike = {
  message: string;
};

export default function ErrorComponent({
  error,
  element = "div",
}: {
  element?: "div" | "span";
  error: TRPCClientErrorLike<AppRouter> | ErrorLike;
}) {
  const Comp = element === "div" ? "div" : "span";
  return (
    <Comp className="flex h-full flex-col items-center justify-center gap-4 pt-8">
      <CircleXIcon className="size-10 text-red-500" />
      <span className="font-medium text-sm">
        {error.message ?? "An unknown error occurred"}
      </span>
    </Comp>
  );
}
