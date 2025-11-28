import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/lib/auth-hooks";
import ShowBackupCodes from "./show-backup-codes";

export default function TwoFactorAuthentication() {
  const { user } = useSession();
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
      </CardHeader>
      <CardContent>{user?.twoFactorEnabled && <ShowBackupCodes />}</CardContent>
      <CardFooter>
        <div className="flex w-full justify-center gap-2">
          {user?.twoFactorEnabled && (
            <Button
              onClick={() => {
                navigate({
                  to: "/profile/disable-two-factor",
                });
              }}
              variant="destructive"
            >
              Disable 2FA
            </Button>
          )}
          {!user?.twoFactorEnabled && (
            <Button
              onClick={() => {
                navigate({
                  to: "/profile/enable-two-factor",
                });
              }}
              variant="outline"
            >
              Enable 2FA
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
