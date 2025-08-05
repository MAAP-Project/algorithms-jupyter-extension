export type AlgorithmConfigInput = {
  name: string;
  label: string;
  doc: string;
  type: string;
  default_value: string;
};

export type AlgorithmConfig = {
  algorithm_name: string;
  algorithm_version: string;
  algorithm_description: string;
  code_repository: string;
  base_command: string;
  min_ram: string;
  min_cores: string;
  container_url: string;
  author: string;
  contributor: string;
  license: string;
  release_notes: string;
  citation: string;
  keywords: string;
  inputs: AlgorithmConfigInput[];
};
