import { RegistrationFormInput } from './types/registration';

/**  JUPYTER  */
export const JUPYTER_EXT = {
  LIST_ALGORITHMS_OPEN_COMMAND: 'list-algorithms-open-command',
  REGISTER_ALGORITHMS_OPEN_COMMAND: 'register-algorithms-open-command',
  BUILDS_DEPLOYMENTS_OPEN_COMMAND: 'builds-deployments-open-command'
};

/** MAAP */
export const MAAP_PROFILE_URL = 'https://uat.maap-project.org/profile/';
export const MAAP_API_URL = 'https://uat.maap-project.org/api/';
export const MAAP_DOCS_REGISTER_ALGORITHM_URL =
  'https://docs.maap-project.org/en/latest/getting_started/running_at_scale.html#Register-an-Algorithm';
export const DEFAULT_MAAP_BASE_CONTAINER_URL =
  'mas.dit.maap-project.org/root/maap-workspaces/custom_images/maap_base:develop';

/*******************************
 * MAAP API OGC ENDPOINTS
 *******************************/
export const MAAP_API_OGC_ENDPOINTS = {
  GET_PROCESSES: 'api/ogc/processes',
  GET_PROCESS: 'api/ogc/processes/{PROCESS_ID}'
};

/**
 * Algorithm registration form fields
 * See AlgorithmData type in src/types/registration.ts
 */
export const FORM_FIELDS = {
  algorithmName: {
    name: 'algorithmName',
    pythonic_name: 'algorithm_name',
    label: 'Algorithm Name',
    tooltip: 'The name of the algorithm.',
    placeholder: 'Enter algorithm name',
    required: true,
    type: 'text'
  } as RegistrationFormInput,
  algorithmVersion: {
    name: 'algorithmVersion',
    pythonic_name: 'algorithm_version',
    label: 'Algorithm Version',
    tooltip:
      'The tag or branch of the source code repository to build the algorithm from (e.g., develop, 1.0.0)',
    placeholder: 'Enter algorithm version',
    required: true,
    type: 'text'
  } as RegistrationFormInput,
  algorithmDescription: {
    name: 'algorithmDescription',
    pythonic_name: 'algorithm_description',
    label: 'Algorithm Description',
    tooltip: 'Description of the algorithm.',
    placeholder: 'Enter algorithm description',
    required: true,
    type: 'text'
  } as RegistrationFormInput,
  codeRepository: {
    name: 'codeRepository',
    pythonic_name: 'code_repository',
    label: 'Repository URL',
    tooltip: 'The public URL to the algorithm source code repository',
    placeholder: 'Enter code repository URL',
    required: true,
    type: 'text'
  } as RegistrationFormInput,
  runCommand: {
    name: 'runCommand',
    pythonic_name: 'run_command',
    label: 'Run Command',
    tooltip:
      'The main command to execute your algorithm (e.g., sardem-sarsen/sardem-sarsem.sh)',
    placeholder: 'Enter run command',
    required: true,
    type: 'text'
  } as RegistrationFormInput,
  ramMin: {
    name: 'ramMin',
    pythonic_name: 'ram_min',
    label: 'Minimum RAM (GB)',
    tooltip:
      'The minimum amount of RAM (in GB) required to run your algorithm. Max is 128. (e.g., 16)',
    placeholder: 'Enter minimum RAM',
    required: true,
    type: 'number'
  } as RegistrationFormInput,
  coresMin: {
    name: 'coresMin',
    pythonic_name: 'cores_min',
    label: 'Minimum Number of Cores',
    tooltip:
      'The minimum number of CPU cores required to run your algorithm. Max 32 cores. (e.g., 1)',
    placeholder: 'Enter minimum number of cores',
    required: true,
    type: 'number'
  } as RegistrationFormInput,
  baseContainerURL: {
    name: 'baseContainerURL',
    pythonic_name: 'base_container_url',
    label: 'Base Container URL',
    tooltip:
      'The URL to the base docker image which the algorithm will be built off of.',
    placeholder: 'Enter base container URL',
    type: 'text',
    default: DEFAULT_MAAP_BASE_CONTAINER_URL
  } as RegistrationFormInput,
  author: {
    name: 'author',
    pythonic_name: 'author',
    label: 'Author',
    tooltip: 'The primary author of the algorithm',
    placeholder: 'Enter author name',
    type: 'text'
  } as RegistrationFormInput,
  contributor: {
    name: 'contributor',
    pythonic_name: 'contributor',
    label: 'Contributor',
    tooltip: 'Additional contributors to the algorithm development',
    placeholder: 'Enter contributor name',
    type: 'text'
  } as RegistrationFormInput,
  license: {
    name: 'license',
    pythonic_name: 'license',
    label: 'License',
    tooltip: 'The license under which your algorithm is distributed',
    placeholder: 'Enter license information',
    type: 'text'
  } as RegistrationFormInput,
  releaseNotes: {
    name: 'releaseNotes',
    pythonic_name: 'release_notes',
    label: 'Release Notes',
    tooltip: 'The URL to the release notes of the algorithm',
    placeholder: 'Enter release notes',
    type: 'text'
  } as RegistrationFormInput,
  citation: {
    name: 'citation',
    pythonic_name: 'citation',
    label: 'Citation',
    tooltip: 'How to cite this algorithm in publications',
    placeholder: 'Enter citation information',
    type: 'text'
  } as RegistrationFormInput,
  keywords: {
    name: 'keywords',
    pythonic_name: 'keywords',
    label: 'Keywords',
    tooltip:
      'Comma-separated keywords to associate with this algorithm. (e.g. sar, ogc)',
    placeholder: 'Enter keywords',
    type: 'text'
  } as RegistrationFormInput,
  algorithmContainerURL: {
    name: 'algorithmContainerURL',
    pythonic_name: 'algorithm_container_url',
    label: 'Algorithm Container URL',
    tooltip: 'The public URL to the pre-built algorithm container image',
    placeholder: 'Enter algorithm container URL',
    type: 'text'
  } as RegistrationFormInput,
  buildCommand: {
    name: 'buildCommand',
    pythonic_name: 'build_command',
    label: 'Build Command',
    tooltip:
      'The command to build the algorithm environment in the base container',
    placeholder: 'Enter build command',
    type: 'text'
  } as RegistrationFormInput
};
