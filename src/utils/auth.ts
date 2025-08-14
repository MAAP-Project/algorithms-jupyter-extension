export const getMaapToken = (): string | null => {
  return localStorage.getItem('MAAP_PGT_TOKEN');
};

export const setMaapToken = (token: string): void => {
  localStorage.setItem('MAAP_PGT_TOKEN', token);
};

export const hasMaapToken = (): boolean => {
  return localStorage.hasOwnProperty('MAAP_PGT_TOKEN');
};

export const clearMaapToken = (): void => {
  localStorage.removeItem('MAAP_PGT_TOKEN');
};