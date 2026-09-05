export function extractErrorMessage(err) {
  return err?.response?.data?.error?.message || err?.message || 'Something went wrong';
}
