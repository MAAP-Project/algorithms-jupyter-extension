export type AlgorithmConfigInput = {
  name: string;
  label: string;
  doc: string;
  type: string;
  default: string | number;
};

export type AlgorithmConfigOutput = {
  name: string;
  label?: string;
  doc?: string;
  type: string;
  default?: string;
};

export type AlgorithmConfig = {
  algorithm_name: string;
  algorithm_version: string;
  algorithm_description: string;
  code_repository: string;
  run_command: string;
  build_command: string;
  ram_min: number;
  cores_min: number;
  algorithm_container_url: string;
  base_container_url: string;
  author: string;
  contributor: string;
  license: string;
  release_notes: string;
  citation: string;
  keywords: string;
  inputs: AlgorithmConfigInput[];
  outputs: AlgorithmConfigOutput[];
  outdir_max: number;
};
