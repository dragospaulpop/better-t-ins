import { Loader2 } from "lucide-react";

export default function Loader({
  element = "div",
}: {
  element?: "div" | "span";
}) {
  const Comp = element === "div" ? "div" : "span";
  return (
    <Comp className="flex h-full items-center justify-center pt-8">
      <Loader2 className="animate-spin" />
    </Comp>
  );
}
