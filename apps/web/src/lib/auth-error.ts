interface BetterAuthClientError extends Error {
  error?: {
    code?: string;
    message?: string;
  };
  status?: number;
}

export function getAuthErrorMessage(error: Error): string {
  const authError = error as BetterAuthClientError;
  return authError.error?.message ?? error.message ?? "An error occurred";
}

export function getAuthErrorCode(error: Error): string {
  const authError = error as BetterAuthClientError;
  return authError.error?.code ?? "UNKNOWN_ERROR";
}
