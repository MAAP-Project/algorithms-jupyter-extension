export type RegistrationFormInputType = 'text' | 'number';

export type RegistrationFormInput = {
  name: string;
  pythonic_name: string;
  label: string;
  tooltip: string;
  placeholder: string;
  type: RegistrationFormInputType;
  required: boolean;
  default?: string;
};

export type AlgorithmInput = {
  name: string;
  label: string;
  description: string;
  default: string | number;
  type: string;
};

export type AlgorithmInputRow = AlgorithmInput & {
  id: string;
};

export type AlgorithmData = {
  algorithmName: string;
  algorithmVersion: string;
  algorithmDescription: string;
  codeRepository: string;
  runCommand: string;
  ramMin: number;
  coresMin: number;
  buildCommand?: string;
  baseContainerURL?: string;
  algorithmContainerURL?: string;
  author: string;
  contributor: string;
  license: string;
  releaseNotes: string;
  citation: string;
  keywords: string;
  inputs: any[];
};
