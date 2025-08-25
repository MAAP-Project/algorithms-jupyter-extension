import { HOST_URL } from '../constants';

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
export const registerAlgorithm = async (data: any): Promise<any> => {
  const url = `${HOST_URL}/api/build`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // eslint-disable-next-line prettier/prettier
      'cpticket': localStorage.getItem('MAAP_PGT_TOKEN') || ''
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorText = await response.json();
    const message = `HTTP ${response.status}: ${response.statusText}`;
    console.error(`Request failed: ${message}\nDetails: ${errorText}`);
    throw new Error(message);
  }

  const rsp = await response.json();
  console.log('Response from algo reg: ', rsp);
  //return data;
};
