export const isTokenExpired = (expiresAt: number) => {
  // Check if token expires in the next minute to be safe
  return Date.now() >= (expiresAt - 60) * 1000;
};
