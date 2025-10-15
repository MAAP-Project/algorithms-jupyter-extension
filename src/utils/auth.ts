// export const getMaapToken = (): string | null => {
//   return localStorage.getItem('MAAP_PGT_TOKEN');
// };

import { BASE_URL } from './api';

// export const setMaapToken = (token: string): void => {
//   localStorage.setItem('MAAP_PGT_TOKEN', token);
// };

export const hasMaapToken = (): boolean => {
  return localStorage.hasOwnProperty('MAAP_PGT_TOKEN');
};

export const clearMaapToken = (): void => {
  localStorage.removeItem('MAAP_PGT_TOKEN');
};

/**
 * Retrieves the XSRF token from browser local storage
 * @returns {string | undefined} The XSRF token string or undefined if not found
 */
function _getXsrfToken(): string | undefined {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('_xsrf='))
    ?.split('=')[1];
}

/**
 * Validates if a string is a valid environment variable value
 * @param value - The string to validate
 * @returns {boolean} True if the string is a valid environment variable value, false otherwise
 */
function isValidEnvVarValue(value: string): boolean {
  return /^[\x20-\x7E]+$/.test(value);
}

/**
 * Retrieves the MAAP authentication token from browser local storage
 * @returns {string | null} The MAAP PGT token string or null if not found or invalid
 * @throws {Error} Throws an error if the token is not valid environment variable value.
 */
export function getMaapTokenFromLocalStorage(): string | null {
  try {
    const token = localStorage.getItem('MAAP_PGT_TOKEN') || '';
    if (!isValidEnvVarValue(token)) {
      throw new Error(
        `Failed to retrieve MAAP_PGT_TOKEN from browser local storage. Invalid environment variable value: ${token}`
      );
    }
    return token;
  } catch (error) {
    return null;
  }
}

/**
 * Stores the MAAP authentication token in browser local storage
 * @param token - The MAAP PGT token to store
 * @throws {Error} Throws an error if the token is not a valid environment variable value.
 */
export function setMaapTokenToLocalStorage(token: string): void {
  try {
    if (!isValidEnvVarValue(token)) {
      throw new Error(
        `Failed to set MAAP_PGT_TOKEN in browser local storage. Invalid environment variable value: ${token}`
      );
    }
    localStorage.setItem('MAAP_PGT_TOKEN', token);
  } catch (error) {
    console.error(error);
  }
}

/**
 * Retrieves the MAAP_PGT_TOKEN for the current user.
 *
 * This function first attempts to fetch the token from the Jupyter server
 * extension endpoint (`/maap-jupyter-server-extension/get-token`).
 * If the request fails or throws an error, it falls back to retrieving the
 * token from the browser's local storage.
 *
 * @async
 * @function getToken
 * @returns {Promise<string | null>}
 * Resolves to the MAAP_PGT_TOKEN string if successfully retrieved,
 * otherwise returns `null` if both the server request and local storage
 * retrieval fail.
 *
 * @throws {Error}
 * Throws an error if the HTTP request fails or the token cannot
 * be retrieved.
 */
export async function getToken(): Promise<string | null> {
  try {
    const response = await fetch(
      `${BASE_URL}maap-jupyter-server-extension/get-token`
    );
    const data = await response.json();

    if (response.status >= 400 || !data?.token) {
      throw new Error(
        `Failed to retrieve MAAP_PGT_TOKEN environment variable. ${data?.error ?? ''}`
      );
    }

    return data.token;
  } catch (error) {
    console.error(error);

    // Fallback to local storage
    try {
      const token = getMaapTokenFromLocalStorage();
      if (!token) {
        // TODO: if not in local storage, prompt user to set token?
        throw new Error(
          'Failed to retrieve MAAP_PGT_TOKEN from browser local storage.'
        );
      }
      return token;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

/**
 * Attempts to set the `MAAP_PGT_TOKEN` environment variable on the server via a POST request.
 *
 * If the request fails or the server returns an error (e.g. due to invalid JSON,
 * missing token, or a 4xx/5xx status), it falls back to storing the token in
 * the browser's local storage.
 *
 * This function also includes support for CSRF protection using the X-XSRFToken header,
 * and uses `same-origin` credentials to include cookies in the request.
 *
 * @param {string} token - The token string to be stored either in the server's environment
 *                         or in local storage as a fallback.
 * @returns {Promise<void>} Resolves when the token is successfully stored on the server
 *                          or in local storage. Errors are logged to the console but not thrown.
 *
 * @example
 * await setToken("abc123");
 *
 * @throws {Error} If the request to the server fails and storing in local storage also fails,
 *                 the errors are logged but not re-thrown.
 */
export async function setToken(token: string): Promise<void> {
  try {
    const response = await fetch(
      `${BASE_URL}maap-jupyter-server-extension/set-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRFToken': _getXsrfToken() ?? ''
        },
        credentials: 'same-origin',
        body: JSON.stringify({ token })
      }
    );
    const data = await response.json();

    if (response.status >= 400 || !data?.message) {
      throw new Error(
        `Failed to set MAAP_PGT_TOKEN environment variable. ${data?.error ?? ''}`
      );
    }
  } catch (error) {
    console.error(error);

    // Fallback to local storage
    try {
      setMaapTokenToLocalStorage(token);
    } catch (error) {
      console.error(error);
    }
  }
}
