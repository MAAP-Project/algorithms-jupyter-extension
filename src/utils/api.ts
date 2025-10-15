import { MAAP_API_OGC_ENDPOINTS } from '../constants';
import { Notification } from '@jupyterlab/apputils';
import { BuildsResponse, DeploymentsResponse } from '../types/build';
import { getToken } from './auth';
import { openBuildDeploymentDashboard } from './utils';
import { PageConfig } from '@jupyterlab/coreutils';

export const BASE_URL = PageConfig.getBaseUrl();
const MAAP_API_URL = 'https://uat.maap-project.org/'; //await getMaapApiUrl();

/**
 * Fetches the MAAP API URL from the MAAP Jupyter server extension endpoint.
 *
 * This function sends a GET request to the backend route
 * `maap-jupyter-server-extension/get-api-url` and attempts to retrieve the
 * `MAAP_API_URL` environment variable from the server. If the variable is not
 * set or an error occurs during the fetch, the function raises an error and
 * returns `null`.
 *
 * @returns {Promise<string | null>} A promise that resolves to the MAAP API URL
 * if successfully retrieved, or `null` if the request fails or the variable is missing.
 *
 * @throws {Error} Throws an error if the HTTP request fails or the variable is missing.
 */
export async function getMaapApiUrl(): Promise<string | null> {
  try {
    const response = await fetch(
      `${BASE_URL}maap-jupyter-server-extension/get-api-url`
    );
    const data = await response.json();

    if (response.status >= 400 || !data?.apiUrl) {
      throw new Error(`Failed to retrieve MAAP_API_URL. ${data?.error ?? ''}`);
    }

    return data.apiUrl;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Fetches the list of available processes.
 *
 * This function sends a GET request to the MAAP API and returns an array of
 * processes. If the request fails, an error is thrown.
 *
 * @returns {Promise<any>} A promise that resolves to the list of processes
 *                        returned by the MAAP API, or `null` if the request fails.
 *
 * @throws {Error} An error is thrown if the request fails or if data or data.processes is null.
 */
export async function getProcesses(): Promise<any> {
  try {
    const response = await fetch(
      MAAP_API_URL + MAAP_API_OGC_ENDPOINTS.GET_PROCESSES
    );
    const data = await response.json();

    if (response.status >= 400 || !data?.processes) {
      throw Error('Failed to list processes.');
    }

    return data.processes;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Fetches the details of a specific process.
 *
 * This function sends a GET request to the MAAP API to retrieve the full
 * description of a process, using the given `processId`. If a processId is not
 * provided or the request fails, an error is thrown.
 *
 * @param {string} processId - The ID of the process to retrieve.
 * @returns {Promise<any>} A promise that resolves to the process details object,
 *                         or `null` if the request fails or the ID is missing.
 * @throws {Error} An error is thrown if the processId is not provided or if the request fails.
 *
 */
export async function getProcess(processId: string): Promise<any> {
  try {
    if (!processId) {
      throw Error('Failed to retrieve process. Process ID must be provided.');
    }

    const url = new URL(
      MAAP_API_URL +
        MAAP_API_OGC_ENDPOINTS.GET_PROCESS.replace('{PROCESS_ID}', processId)
    );
    const response = await fetch(url.toString());
    const data = await response.json();

    if (response.status >= 400 || !data) {
      throw Error(`Failed to retrieve process. ${data?.detail ?? ''}`);
    }

    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Check to see whether or not registers as ogc process -- /mas/algorithm may not ultimately make the /processes post call.
 * @param processResource
 * @returns
 */
export const registerAlgorithm = async (
  data: any,
  jupyterApp?: any
): Promise<any> => {
  const url = `${MAAP_API_URL}build`;
  let message = '';

  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: data
  });

  if (!response.ok) {
    message = `Failed to submit algorithm for registration: \nHTTP ${response.status}: ${response.statusText}`;
    Notification.error(message, { autoClose: false });
    console.error(`Request failed: ${message}`);
    throw new Error(message);
  }

  const rsp = await response.json();
  console.log('Response from algorithm registration submission:: ', rsp);
  if (rsp.status === 'accepted') {
    message = `Algorithm successfully submitted for registration. Build ID: ${rsp.build_id}. `;

    if (jupyterApp) {
      Notification.success(message, {
        autoClose: false,
        actions: [
          {
            label: 'View build & deployment status',
            callback: () => {
              openBuildDeploymentDashboard(jupyterApp, null);
            }
          }
        ]
      });
    } else {
      // Fallback to plain text if no jupyterApp provided
      Notification.success(message, { autoClose: false });
    }
  }
};

// Helper function for authenticated requests using cpticket header
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = await getToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      cpticket: token,
      'Content-Type': 'application/json'
    }
  });
};

export const getBuilds = async (): Promise<BuildsResponse> => {
  const url = `${MAAP_API_URL}build`;

  const response = await fetchWithAuth(url);

  if (!response.ok) {
    let errorText: string;
    try {
      errorText = await response.json();
    } catch (e) {
      errorText = await response.text();
    }
    const message = `HTTP ${response.status}: ${response.statusText}`;
    console.error(`Builds request failed: ${message}\nDetails: ${errorText}`);
    throw new Error(message);
  }

  const data = await response.json();
  return data;
};

export const getDeployments = async (): Promise<DeploymentsResponse> => {
  const url = `${MAAP_API_URL}ogc/deploymentJobs`;

  const response = await fetchWithAuth(url);

  if (!response.ok) {
    let errorText: string;
    try {
      errorText = await response.json();
    } catch (e) {
      errorText = await response.text();
    }
    const message = `HTTP ${response.status}: ${response.statusText}`;
    console.error(
      `Deployments request failed: ${message}\nDetails: ${errorText}`
    );
    throw new Error(message);
  }

  const data = await response.json();
  return data;
};

export const getBuildStatus = async (buildId: string): Promise<any> => {
  const url = `${MAAP_API_URL}build/${buildId}`;

  const response = await fetchWithAuth(url);

  if (!response.ok) {
    let errorText: string;
    try {
      errorText = await response.json();
    } catch (e) {
      errorText = await response.text();
    }
    const message = `HTTP ${response.status}: ${response.statusText}`;
    console.error(
      `Build status request failed: ${message}\nDetails: ${errorText}`
    );
    throw new Error(message);
  }

  const data = await response.json();
  return data;
};

export const getDeploymentStatus = async (
  deploymentId: string
): Promise<any> => {
  const url = `${MAAP_API_URL}ogc/deploymentJobs/${deploymentId}`;

  const response = await fetchWithAuth(url);

  if (!response.ok) {
    let errorText: string;
    try {
      errorText = await response.json();
    } catch (e) {
      errorText = await response.text();
    }
    const message = `HTTP ${response.status}: ${response.statusText}`;
    console.error(
      `Deployment status request failed: ${message}\nDetails: ${errorText}`
    );
    throw new Error(message);
  }

  const data = await response.json();
  return data;
};
