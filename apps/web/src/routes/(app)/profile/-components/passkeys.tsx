import { useRouter } from "@tanstack/react-router";
import { KeyIcon } from "lucide-react";
import { Fragment } from "react/jsx-runtime";
import Loader from "@/components/loader";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import Whoops from "@/components/whoops";
import { useListPasskeys } from "@/lib/auth-hooks";
import AddPasskey from "./add-passkey";
import DeletePasskey from "./delete-passkey";

export default function Passkeys() {
  const {
    data: passkeys,
    error: passkeyError,
    isPending: isPasskeyPending,
  } = useListPasskeys();
  const router = useRouter();

  if (isPasskeyPending) {
    return (
      <div className="flex justify-center">
        <Loader />
      </div>
    );
  }

  if (passkeyError) {
    return (
      <div className="flex justify-center">
        <Whoops
          error={passkeyError}
          retry={() => {
            router.invalidate();
          }}
        />
      </div>
    );
  }

  if (passkeys && passkeys.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Passkeys</CardTitle>
        </CardHeader>
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia>
                <KeyIcon className="size-10" />
              </EmptyMedia>
              <EmptyTitle>No passkeys found</EmptyTitle>
              <EmptyDescription>Add a passkey to get started</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <AddPasskey />
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Passkeys</CardTitle>
      </CardHeader>
      <CardContent>
        <ItemGroup>
          {passkeys.map((passkey, index) => (
            <Fragment key={passkey.id}>
              <Item key={passkey.id}>
                <ItemContent>
                  <ItemTitle>{passkey.name}</ItemTitle>
                  <ItemDescription>{passkey.id}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <DeletePasskey id={passkey.id} />
                </ItemActions>
              </Item>
              {index !== passkeys.length - 1 && <ItemSeparator />}
            </Fragment>
          ))}
        </ItemGroup>
      </CardContent>
      <CardFooter>
        <div className="flex w-full justify-center">
          <AddPasskey />
        </div>
      </CardFooter>
    </Card>
  );
}
