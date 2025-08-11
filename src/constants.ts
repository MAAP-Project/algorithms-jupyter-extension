import { RegistrationFormInput } from './types/registration';

/**  JUPYTER  */
export const JUPYTER_EXT = {
  LIST_ALGORITHMS_OPEN_COMMAND: 'list-algorithms-open-command',
  REGISTER_ALGORITHMS_OPEN_COMMAND: 'register-algorithms-open-command'
};

/** MAAP */
export const HOST_URL = 'https://api.dit.maap-project.org';
export const MAAP_PROFILE_URL = 'https://dit.maap-project.org/profile/';
export const MAAP_DOCS_REGISTER_ALGORITHM_URL =
  'https://docs.maap-project.org/en/latest/getting_started/running_at_scale.html#Register-an-Algorithm';

/**
 * Algorithm registration form fields
 * See AlgorithmData type in src/types/registration.ts
 * TODO: minRam vs ramMin -- check syntax
 */
export const FORM_FIELDS = {
  algorithmName: {
    name: 'algorithmName',
    pythonic_name: 'algorithm_name',
    label: 'Algorithm Name',
    tooltip: 'The name of the algorithm.',
    placeholder: 'Enter algorithm name'
  } as RegistrationFormInput,
  version: {
    name: 'algorithmVersion',
    pythonic_name: 'algorithm_version',
    label: 'Version',
    tooltip: 'The version of the algorithm (e.g., develop, 1.0.0)',
    placeholder: 'Enter algorithm version'
  } as RegistrationFormInput,
  description: {
    name: 'algorithmDescription',
    pythonic_name: 'algorithm_description',
    label: 'Algorithm Description',
    tooltip: 'Description of the algorithm.',
    placeholder: 'Enter algorithm description'
  } as RegistrationFormInput,
  codeRepository: {
    name: 'codeRepository',
    pythonic_name: 'code_repository',
    label: 'Repository URL',
    tooltip: 'The URL to the algorithm source code repository',
    placeholder: 'Enter code repository URL'
  } as RegistrationFormInput,
  runCommand: {
    name: 'runCommand',
    pythonic_name: 'run_command',
    label: 'Run Command',
    tooltip:
      'The main command to execute your algorithm (e.g., /app/sardem-sarsen/sardem-sarsem.sh)',
    placeholder: 'Enter run command'
  } as RegistrationFormInput,
  minRAM: {
    name: 'minRAM',
    pythonic_name: 'min_ram',
    label: 'Minimum RAM',
    tooltip:
      'The minimum amount of RAM (in GB) required to run your algorithm (e.g., 4)',
    placeholder: 'Enter minimum RAM'
  } as RegistrationFormInput,
  minCores: {
    name: 'minCores',
    pythonic_name: 'min_cores',
    label: 'Minimum Number of Cores',
    tooltip:
      'The minimum number of CPU cores required to run your algorithm (e.g., 1)',
    placeholder: 'Enter minimum number of cores'
  } as RegistrationFormInput,
  baseContainerURL: {
    name: 'baseContainerURL',
    pythonic_name: 'base_container_url',
    label: 'Base Container URL',
    tooltip:
      'The URL to the base docker image (see docs here for a list of available base containers)',
    placeholder: 'Enter base container URL'
  } as RegistrationFormInput,
  author: {
    name: 'author',
    pythonic_name: 'author',
    label: 'Author',
    tooltip: 'The primary author of the algorithm',
    placeholder: 'Enter author name'
  } as RegistrationFormInput,
  contributor: {
    name: 'contributor',
    pythonic_name: 'contributor',
    label: 'Contributor',
    tooltip: 'Additional contributors to the algorithm development',
    placeholder: 'Enter contributor name'
  } as RegistrationFormInput,
  license: {
    name: 'license',
    pythonic_name: 'license',
    label: 'License',
    tooltip: 'The license under which your algorithm is distributed',
    placeholder: 'Enter license information'
  } as RegistrationFormInput,
  releaseNotes: {
    name: 'releaseNotes',
    pythonic_name: 'release_notes',
    label: 'Release Notes',
    tooltip: 'The URL to the release notes of the algorithm',
    placeholder: 'Enter release notes'
  } as RegistrationFormInput,
  citation: {
    name: 'citation',
    pythonic_name: 'citation',
    label: 'Citation',
    tooltip: 'How to cite this algorithm in publications',
    placeholder: 'Enter citation information'
  } as RegistrationFormInput,
  keywords: {
    name: 'keywords',
    pythonic_name: 'keywords',
    label: 'Keywords',
    tooltip: 'Comma-separated keywords to associate with this algorithm',
    placeholder: 'Enter keywords'
  } as RegistrationFormInput,
  algorithmContainerURL: {
    name: 'algorithmContainerURL',
    pythonic_name: 'algorithm_container_url',
    label: 'Algorithm Container URL',
    tooltip: 'The URL to the pre-built algorithm container image',
    placeholder: 'Enter algorithm container URL'
  } as RegistrationFormInput,
  buildCommand: {
    name: 'buildCommand',
    pythonic_name: 'build_command',
    label: 'Build Command',
    tooltip:
      'The command to build the algorithm environment in the base container',
    placeholder: 'Enter build command'
  } as RegistrationFormInput
};
