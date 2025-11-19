import { createFileRoute } from "@tanstack/react-router";
import { BreadcrumbDemo } from "./-components/breadcrumb-nav";
import Folders from "./-components/folders";
import { Uploader } from "./-components/uploader";

export const Route = createFileRoute("/(app)/files/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="justify- flex min-h-full flex-col items-start gap-4">
      <BreadcrumbDemo />
      <Folders />
      <div className="flex min-h-full w-full flex-1 flex-col items-center justify-center">
        <Uploader />
      </div>
    </div>
  );
}
