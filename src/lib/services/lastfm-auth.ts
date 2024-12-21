export async function authorizeLastFm(username: string) {
  localStorage.setItem('lastfm_username', username);
  return true;
}

export async function unauthorizeLastFm() {
  localStorage.removeItem('lastfm_username');
  return true;
}
