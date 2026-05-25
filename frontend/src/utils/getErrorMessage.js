export const getErrorMessage = (error, fallback = 'Something went wrong') => {
  if (typeof error === 'string') return error;
  return error?.response?.data?.message || error?.message || fallback;
};
