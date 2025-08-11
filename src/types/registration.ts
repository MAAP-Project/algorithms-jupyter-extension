export type RegistrationFormInput = {
  name: string;
  pythonic_name: string;
  label: string;
  tooltip: string;
  placeholder: string;
};

export type AlgorithmInput = {
  name: string;
  label: string;
  description: string;
  defaultValue: string;
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
  minRAM: string;
  minCores: string;
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
