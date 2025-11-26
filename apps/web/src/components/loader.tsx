import { Spinner } from "./ui/spinner";

export default function Loader({
  element = "div",
}: {
  element?: "div" | "span";
}) {
  const Comp = element === "div" ? "div" : "span";
  return (
    <Comp className="flex h-full items-center justify-center pt-8">
      <Spinner />
    </Comp>
  );
}
