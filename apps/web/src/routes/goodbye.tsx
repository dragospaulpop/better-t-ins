import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/goodbye")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <img
        alt="Logo"
        className="mb-4 size-16"
        height={64}
        src="/logo.png"
        width={64}
      />
      <h1 className="font-bold text-2xl">Goodbye!</h1>
      <p className="text-muted-foreground">Your account has been deleted.</p>
    </div>
  );
}
