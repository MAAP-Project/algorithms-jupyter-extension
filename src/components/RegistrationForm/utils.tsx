import { FORM_FIELDS } from '../../constants';
import {
  AlgorithmConfig,
  AlgorithmConfigInput
} from '../../types/algorithmConfig';
import { AlgorithmData } from '../../types/registration';
import { getPythonFromJSName } from '../../utils/utils';
import * as yaml from 'yaml';

const _validateRAMMin = (ramMin: any) => {
  let msg = '';
  if (!ramMin) {
    msg = 'Please specify the minimum amount of RAM required for the algorithm.';
    console.error(msg);
    alert(msg);
    return false;
  }

  if (ramMin > 128 || ramMin < 1) {
    msg = 'Minimum RAM must be between 1 and 128';
    console.error(msg);
    alert(msg);
    return false;
  }
  return true;
};

const _validateCoresMin = (coresMin: any) => {
  let msg = '';
  if (!coresMin) {
    msg =
      'Please specify the minimum number of cores required for the algorithm.';
    console.error(msg);
    alert(msg);
    return false;
  }

  if (coresMin > 32 || coresMin < 1) {
    msg = 'Minimum number of cores must be between 1 and 32';
    console.error(msg);
    alert(msg);
    return false;
  }
  return true;
};

const _validateAlgorithmName = (algorithmName: string) => {
  let msg = '';
  if (!algorithmName) {
    msg = 'algorithm_name is required';
    console.error(msg);
    alert(msg);
    return false;
  }

  if (algorithmName.length < 2 || algorithmName.length > 255) {
    msg = 'algorithm_name must be between 2 and 255 characters long';
    console.error(msg);
    alert(msg);
    return false;
  }

  const pattern = /^[a-z0-9_-]+$/;
  if (!pattern.test(algorithmName)) {
    msg =
      'algorithm_name can only contain lowercase letters, digits, hyphens (-), and underscores (_)';
    console.error(msg);
    alert(msg);
    return false;
  }
  return true;
};

const _validateAlgorithmVersion = (algorithmVersion: string) => {
  let msg = '';
  if (!algorithmVersion) {
    msg = 'algorithm_version is required';
    console.error(msg);
    alert(msg);
    return false;
  }

  if (algorithmVersion.length > 128) {
    msg = 'algorithm_version can be up to 128 characters long';
    console.error(msg);
    alert(msg);
    return false;
  }

  const pattern = /^[a-zA-Z0-9_][a-zA-Z0-9._-]{0,127}$/;
  if (!pattern.test(algorithmVersion)) {
    msg =
      'algorithm_version must start with a letter, digit, or underscore and can only contain letters, digits, underscores (_), periods (.), and dashes (-)';
    console.error(msg);
    alert(msg);
    return false;
  }
  return true;
};

// need to differentiate between valid for loading into the UI (does not need all fields to be present as user may modify)
// versus valid for submission, where we need to check for missing fields.)
export const isValidAlgorithmConfig = (
  config: AlgorithmConfig,
  checkIsValidForSubmit: boolean
): boolean => {
  let msg = '';
  if (
    config.algorithm_container_url &&
    (config.base_container_url || config.build_command)
  ) {
    msg =
      "INVALID ALGORITHM CONFIG: Either 'algorithm_container_url' or 'base_container_url' and 'build_command' must be provided";
  }

  if (checkIsValidForSubmit) {
    if (!_validateAlgorithmName(config.algorithm_name)) {
      return false;
    }
    if (!_validateAlgorithmVersion(config.algorithm_version)) {
      return false;
    }
    if (!_validateRAMMin(config.ram_min)) {
      return false;
    }
    if (!_validateCoresMin(config.cores_min)) {
      return false;
    }
  }

  if (msg) {
    console.error(msg);
    alert(msg);
    return false;
  }

  return true;
};

export const buildAlgorithmConfig = (data: AlgorithmData): string => {
  const configData: AlgorithmConfig = {
    algorithm_name: '',
    algorithm_version: '',
    algorithm_description: '',
    code_repository: '',
    run_command: '',
    build_command: '',
    ram_min: 0,
    cores_min: 0,
    algorithm_container_url: '',
    base_container_url: '',
    author: '',
    contributor: '',
    license: '',
    release_notes: '',
    citation: '',
    keywords: '',
    inputs: [],
    outputs: [],
    outdir_max: 0
  };

  Object.keys(data).forEach(key => {
    const pythonName = getPythonFromJSName(key);
    if (pythonName !== '') {
      configData[pythonName] = data[key];
    }
  });

  if (data.inputs && data.inputs.length > 0) {
    configData.inputs = [];
    data.inputs.forEach((input: AlgorithmConfigInput) => {
      configData.inputs.push({
        name: input.name || '',
        label: input.label || '',
        doc: input.doc || '',
        type: input.type || '',
        default_value: input.default_value || ''
      });
    });
  }

  // Remove empty string entries
  Object.keys(configData).forEach(key => {
    if (configData[key] === '') {
      delete configData[key];
    }
  });

  if (configData.inputs && configData.inputs.length > 0) {
    Object.keys(configData.inputs).forEach(key => {
      Object.keys(configData.inputs[key]).forEach(subKey => {
        if (configData.inputs[key][subKey] === '') {
          delete configData.inputs[key][subKey];
        }
      });
    });
  }

  configData.outdir_max = 20;
  configData.outputs.push({
    name: 'out',
    type: 'Directory'
  });

  // TODO: order yml keys

  if (!isValidAlgorithmConfig(configData, true)) {
    console.error('Invalid algorithm config');
    return '';
  }

  return yaml.stringify(configData);
};

export const setInputValue = (name: string, value: any) => {
  // for each formfield that has pythonic name match, get that name
  const formFields = Object.values(FORM_FIELDS);
  const formField = formFields.find(field => field.pythonic_name === name);
  if (formField) {
    const inputElement = document.querySelector(
      `input[name="${formField.name}"]`
    ) as HTMLInputElement;
    if (inputElement) {
      inputElement.value = value;
    }
  }
  return false;
};
