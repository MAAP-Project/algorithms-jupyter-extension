import { HOST_URL, JUPYTER_EXT } from '../constants';
import { Notification } from '@jupyterlab/apputils';
import { BuildsResponse, DeploymentsResponse } from '../types/build';
import { getMaapToken } from './auth';
import { openBuildDeploymentDashboard } from './utils';

// TODO: make promise type the type of the ogc request, of which processes is only a single key
export const getProcesses = async (): Promise<any> => {
  const url = `${HOST_URL}/api/ogc/processes`;

  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.json();
    const message = `HTTP ${response.status}: ${response.statusText}`;
    console.error(`Request failed: ${message}\nDetails: ${errorText}`);
    throw new Error(message);
  }

  const data = await response.json();
  return data.processes;
};

export const getProcess = async (processResource: string): Promise<any> => {
  const url = `${HOST_URL}/api/${processResource}`;

  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.json();
    const message = `HTTP ${response.status}: ${response.statusText}`;
    console.error(`Request failed: ${message}\nDetails: ${errorText}`);
    throw new Error(message);
  }

  const data = await response.json();
  return data;
};

/**
 * Check to see whether or not registers as ogc process -- /mas/algorithm may not ultimately make the /processes post call.
 * @param processResource
 * @returns
 */
export const registerAlgorithm = async (
  data: any,
  jupyterApp?: any
): Promise<any> => {
  const url = `${HOST_URL}/api/build`;
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
  const token = getMaapToken();
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
  const url = `${HOST_URL}/api/build`;

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
  const url = `${HOST_URL}/api/ogc/deploymentJobs`;

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
  const url = `${HOST_URL}/api/build/${buildId}`;

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
  const url = `${HOST_URL}/api/ogc/deploymentJobs/${deploymentId}`;

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
