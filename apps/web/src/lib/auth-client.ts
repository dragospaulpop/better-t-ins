import { passkeyClient } from "@better-auth/passkey/client";
import type { auth } from "@tud-box/auth";
import {
  adminClient,
  inferAdditionalFields,
  magicLinkClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_SERVER_URL,
  plugins: [
    inferAdditionalFields<typeof auth>(),
    twoFactorClient(),
    magicLinkClient(),
    passkeyClient(),
    adminClient(),
  ],
});
