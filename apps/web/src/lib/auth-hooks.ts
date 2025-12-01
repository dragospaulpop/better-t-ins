import {
  AuthQueryContext,
  type AuthQueryOptions,
  createAuthHooks,
} from "@daveyplate/better-auth-tanstack";

import { useContext } from "react";
import { authClient } from "./auth-client";

const {
  useSession,
  usePrefetchSession,
  useToken,
  useListAccounts,
  useListSessions,
  useListDeviceSessions,
  useListPasskeys,
  useUpdateUser,
  useUnlinkAccount,
  useRevokeOtherSessions,
  useRevokeSession,
  useRevokeSessions,
  useSetActiveSession,
  useRevokeDeviceSession,
  useDeletePasskey,
  useAuthQuery,
  useAuthMutation,
} = createAuthHooks(authClient);

function useAddPasskey(options?: Partial<AuthQueryOptions>) {
  const { listPasskeysKey: queryKey } = useContext(AuthQueryContext);

  return useAuthMutation({
    queryKey,
    mutationFn: authClient.passkey.addPasskey,
    options,
  });
}

function useDisable2FA(options?: Partial<AuthQueryOptions>) {
  const { sessionKey: queryKey } = useContext(AuthQueryContext);

  return useAuthMutation({
    queryKey,
    mutationFn: authClient.twoFactor.disable,
    options,
  });
}

function useEnable2FA(options?: Partial<AuthQueryOptions>) {
  const { sessionKey: queryKey } = useContext(AuthQueryContext);

  return useAuthMutation({
    queryKey,
    mutationFn: authClient.twoFactor.enable,
    options,
  });
}

function useVerify2FA(options?: Partial<AuthQueryOptions>) {
  const { sessionKey: queryKey } = useContext(AuthQueryContext);

  return useAuthMutation({
    queryKey,
    mutationFn: authClient.twoFactor.verifyTotp,
    options,
  });
}

function useSignOut(options?: Partial<AuthQueryOptions>) {
  const { sessionKey: queryKey } = useContext(AuthQueryContext);

  return useAuthMutation({
    queryKey,
    mutationFn: authClient.signOut,
    options,
  });
}

function useSignIn(options?: Partial<AuthQueryOptions>) {
  const { sessionKey: queryKey } = useContext(AuthQueryContext);

  return useAuthMutation({
    queryKey,
    mutationFn: authClient.signIn.email,
    options,
  });
}

function useSignUp(options?: Partial<AuthQueryOptions>) {
  const { sessionKey: queryKey } = useContext(AuthQueryContext);

  return useAuthMutation({
    queryKey,
    mutationFn: authClient.signUp.email,
    options,
  });
}

function useSendVerificationEmail(options?: Partial<AuthQueryOptions>) {
  const { sessionKey: queryKey } = useContext(AuthQueryContext);

  return useAuthMutation({
    queryKey,
    mutationFn: authClient.sendVerificationEmail,
    options,
  });
}

function useSignInPasskey(options?: Partial<AuthQueryOptions>) {
  const { sessionKey: queryKey } = useContext(AuthQueryContext);

  return useAuthMutation({
    queryKey,
    mutationFn: authClient.signIn.passkey,
    options,
  });
}

function useVerifyTotp(options?: Partial<AuthQueryOptions>) {
  const { sessionKey: queryKey } = useContext(AuthQueryContext);

  return useAuthMutation({
    queryKey,
    mutationFn: authClient.twoFactor.verifyTotp,
    options,
  });
}

function useVerifyOtp(options?: Partial<AuthQueryOptions>) {
  const { sessionKey: queryKey } = useContext(AuthQueryContext);

  return useAuthMutation({
    queryKey,
    mutationFn: authClient.twoFactor.verifyOtp,
    options,
  });
}

function useVerifyBackupCode(options?: Partial<AuthQueryOptions>) {
  const { sessionKey: queryKey } = useContext(AuthQueryContext);

  return useAuthMutation({
    queryKey,
    mutationFn: authClient.twoFactor.verifyBackupCode,
    options,
  });
}

function useSendOtp(options?: Partial<AuthQueryOptions>) {
  const { sessionKey: queryKey } = useContext(AuthQueryContext);

  return useAuthMutation({
    queryKey,
    mutationFn: authClient.twoFactor.sendOtp,
    options,
  });
}

function useSendMagicLink(options?: Partial<AuthQueryOptions>) {
  const { sessionKey: queryKey } = useContext(AuthQueryContext);

  return useAuthMutation({
    queryKey,
    mutationFn: authClient.signIn.magicLink,
    options,
  });
}

function useRequestPasswordReset(options?: Partial<AuthQueryOptions>) {
  const { sessionKey: queryKey } = useContext(AuthQueryContext);

  return useAuthMutation({
    queryKey,
    mutationFn: authClient.requestPasswordReset,
    options,
  });
}

function useResetPassword(options?: Partial<AuthQueryOptions>) {
  const { sessionKey: queryKey } = useContext(AuthQueryContext);

  return useAuthMutation({
    queryKey,
    mutationFn: authClient.resetPassword,
    options,
  });
}

function useChangePassword(options?: Partial<AuthQueryOptions>) {
  const { sessionKey: queryKey } = useContext(AuthQueryContext);

  return useAuthMutation({
    queryKey,
    mutationFn: authClient.changePassword,
    options,
  });
}

function useDeleteUser(options?: Partial<AuthQueryOptions>) {
  const { sessionKey: queryKey } = useContext(AuthQueryContext);

  return useAuthMutation({
    queryKey,
    mutationFn: authClient.deleteUser,
    options,
  });
}

export {
  useSession,
  usePrefetchSession,
  useToken,
  useListAccounts,
  useListSessions,
  useListDeviceSessions,
  useListPasskeys,
  useUpdateUser,
  useUnlinkAccount,
  useRevokeOtherSessions,
  useRevokeSession,
  useRevokeSessions,
  useSetActiveSession,
  useRevokeDeviceSession,
  useDeletePasskey,
  useAuthQuery,
  useAuthMutation,
  useAddPasskey,
  useDisable2FA,
  useEnable2FA,
  useVerify2FA,
  useSignOut,
  useSignIn,
  useSignUp,
  useSendVerificationEmail,
  useSignInPasskey,
  useVerifyTotp,
  useSendOtp,
  useVerifyBackupCode,
  useVerifyOtp,
  useSendMagicLink,
  useRequestPasswordReset,
  useResetPassword,
  useChangePassword,
  useDeleteUser,
};
