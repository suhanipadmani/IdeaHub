export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') return error;

  if (error instanceof Error) return error.message;

  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const err = error as any;
    return err.response?.data?.error || err.response?.data?.message || 'Something went wrong';
  }

  return 'Something went wrong';
};
