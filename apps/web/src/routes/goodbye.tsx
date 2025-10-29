import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/goodbye")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Goodbye! Your account has been deleted.</div>;
}
