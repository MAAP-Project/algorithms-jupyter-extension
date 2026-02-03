import { MAAP_API_ENDPOINTS } from '../constants';
import { Notification } from '@jupyterlab/apputils';
import { BuildsResponse, DeploymentsResponse } from '../types/build';
import { openBuildDeploymentDashboard } from './utils';
import { PageConfig } from '@jupyterlab/coreutils';

export const BASE_URL = PageConfig.getBaseUrl();

type MaapSettings = {
  maapApiUrl: string;
  maapToken: string;
};

export type GetLatestSettings = () => Promise<MaapSettings>;

type RequestOptions = Omit<RequestInit, 'headers'> & {
  endpoint?: string;
  url?: string;
  auth?: boolean;
  headers?: Record<string, string>;
  rawBody?: boolean;
};

function joinUrl(base: string, path: string): string {
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

async function readErrorPayload(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const j = await response.json();
      return typeof j === 'string' ? j : JSON.stringify(j);
    }
    return await response.text();
  } catch {
    return '';
  }
}

export function createMaapApi(getLatestSettings: GetLatestSettings) {
  /**
   * Single request helper: always reads latest settings right before calling fetch.
   */
  async function request<T = any>(opts: RequestOptions): Promise<T> {
    const { maapApiUrl, maapToken } = await getLatestSettings();

    const finalUrl =
      opts.url ??
      (opts.endpoint ? joinUrl(maapApiUrl, opts.endpoint) : undefined);

    if (!finalUrl) {
      throw new Error('request() requires either url or endpoint');
    }

    const headers: Record<string, string> = {
      ...(opts.headers ?? {})
    };

    // Only set JSON content-type by default when caller is NOT sending raw body
    if (!opts.rawBody && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (opts.auth) {
      headers['cpticket'] = maapToken;
    }

    const response = await fetch(finalUrl, {
      ...opts,
      headers
    });

    if (!response.ok) {
      const details = await readErrorPayload(response);
      const message = `HTTP ${response.status} ${response.statusText}${
        details ? `\nDetails: ${details}` : ''
      }`;
      throw new Error(message);
    }

    // Try JSON first; fall back to text if no JSON
    const ct = response.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      return (await response.json()) as T;
    }

    // If it isn't JSON, return text (as any)
    return (await response.text()) as any as T;
  }

  // -------------------------
  // API methods
  // -------------------------

  async function getProcesses(): Promise<any> {
    try {
      const data = await request<{ processes: any[] }>({
        endpoint: MAAP_API_ENDPOINTS.GET_PROCESSES,
        method: 'GET'
      });

      if (!data?.processes) {
        throw new Error('Failed to list processes.');
      }
      return data.processes;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async function getProcess(processId: string): Promise<any> {
    try {
      if (!processId) {
        throw new Error(
          'Failed to retrieve process. Process ID must be provided.'
        );
      }

      const endpoint = MAAP_API_ENDPOINTS.GET_PROCESS.replace(
        '{PROCESS_ID}',
        processId
      );

      return await request<any>({
        endpoint,
        method: 'GET'
      });
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  const registerAlgorithm = async (
    data: any,
    jupyterApp?: any
  ): Promise<any> => {
    const endpoint = MAAP_API_ENDPOINTS.BUILD;

    const response = await request<any>({
      endpoint,
      method: 'POST',
      auth: true,
      body: data,
      // If `data` is FormData, set rawBody=true and DON'T force JSON content-type.
      rawBody: data instanceof FormData,
      headers: data instanceof FormData ? {} : undefined
    });

    if (response?.status === 'accepted') {
      const message = `Algorithm successfully submitted for registration. Build ID: ${response.build_id}. `;

      if (jupyterApp) {
        Notification.success(message, {
          autoClose: false,
          actions: [
            {
              label: 'View build & deployment status',
              callback: () => openBuildDeploymentDashboard(jupyterApp, null)
            }
          ]
        });
      } else {
        Notification.success(message, { autoClose: false });
      }
    }

    return response;
  };

  const getBuilds = async (): Promise<BuildsResponse> => {
    return await request<BuildsResponse>({
      endpoint: MAAP_API_ENDPOINTS.BUILD,
      method: 'GET',
      auth: true
    });
  };

  const getDeployments = async (): Promise<DeploymentsResponse> => {
    return await request<DeploymentsResponse>({
      endpoint: MAAP_API_ENDPOINTS.POST_DEPLOYMENTS,
      method: 'GET',
      auth: true
    });
  };

  const getBuildStatus = async (buildId: string): Promise<any> => {
    const endpoint = MAAP_API_ENDPOINTS.GET_BUILD.replace(
      '{BUILD_ID}',
      buildId
    );
    return await request<any>({
      endpoint,
      method: 'GET',
      auth: true
    });
  };

  const getDeploymentStatus = async (deploymentId: string): Promise<any> => {
    const endpoint = MAAP_API_ENDPOINTS.GET_DEPLOYMENTS.replace(
      '{DEPLOYMENT_ID}',
      deploymentId
    );
    return await request<any>({
      endpoint,
      method: 'GET',
      auth: true
    });
  };

  return {
    request,
    getProcesses,
    getProcess,
    registerAlgorithm,
    getBuilds,
    getDeployments,
    getBuildStatus,
    getDeploymentStatus
  };
}

export type MaapApi = ReturnType<typeof createMaapApi>;
