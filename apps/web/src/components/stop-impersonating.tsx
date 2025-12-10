import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ShieldCheckIcon } from "lucide-react";
import { useStopImpersonatingUser } from "@/lib/auth-hooks";
import { Button } from "./ui/button";

export default function StopImpersonating() {
  const { mutateAsync: stopImpersonating } = useStopImpersonatingUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  function handleStopImpersonating() {
    stopImpersonating({}).then(() => {
      queryClient.clear();
      navigate({ to: "/admin/settings" });
    });
  }

  return (
    <Button onClick={handleStopImpersonating} variant="outline">
      <ShieldCheckIcon className="size-4" />
      Stop impersonating
    </Button>
  );
}
