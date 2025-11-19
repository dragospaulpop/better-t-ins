import { createFileRoute } from "@tanstack/react-router";
import { Uploader } from "./-components/uploader";

export const Route = createFileRoute("/files/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <Uploader />
    </main>
  );
}
