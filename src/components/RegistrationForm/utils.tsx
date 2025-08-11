import { AlgorithmConfigInput } from '../../types/algorithmConfig';
import { AlgorithmData } from '../../types/registration';

export const formatAlgorithmData = (data: AlgorithmData): string => {
  const configData: string[] = [];

  console.log('data', data);

  if (data.algorithmName) {
    configData.push(`algorithm_name: ${data.algorithmName}`);
  }
  if (data.algorithmVersion) {
    configData.push(`algorithm_version: ${data.algorithmVersion}`);
  }
  if (data.algorithmDescription) {
    configData.push(`algorithm_description: ${data.algorithmDescription}`);
  }
  if (data.codeRepository) {
    configData.push(`code_repository: ${data.codeRepository}`);
  }
  if (data.runCommand) {
    configData.push(`run_command: ${data.runCommand}`);
  }
  if (data.author) {
    configData.push(`author: ${data.author}`);
  }
  if (data.citation) {
    configData.push(`citation: ${data.citation}`);
  }
  if (data.contributor) {
    configData.push(`contributor: ${data.contributor}`);
  }
  if (data.baseContainerURL) {
    configData.push(`base_container_url: ${data.baseContainerURL}`);
  }
  if (data.keywords) {
    configData.push(`keywords: ${data.keywords}`);
  }
  if (data.license) {
    configData.push(`license: ${data.license}`);
  }
  if (data.releaseNotes) {
    configData.push(`release_notes: ${data.releaseNotes}`);
  }
  if (data.minRAM) {
    configData.push(`min_ram: ${data.minRAM}`);
  }
  if (data.minCores) {
    configData.push(`min_cores: ${data.minCores}`);
  }
  if (data.buildCommand) {
    configData.push(`build_command: ${data.buildCommand}`);
  }
  if (data.algorithmContainerURL) {
    configData.push(`algorithm_container_url: ${data.algorithmContainerURL}`);
  }

  if (data.inputs && data.inputs.length > 0) {
    const inputs = ['inputs:'];
    data.inputs.forEach((input: AlgorithmConfigInput) => {
      inputs.push(`  - name: ${input.name || ''}`);
      inputs.push(`    label: ${input.label || ''}`);
      inputs.push(`    description: ${input.doc || ''}`);
      inputs.push(`    type: ${input.type || ''}`);
      inputs.push(`    default_value: ${input.default_value || ''}`);
    });
    configData.push(inputs.join('\n'));
  }

  // TODO: update to be configurable once backend supports this
  configData.push('outdir_max: 20');
  configData.push('outputs:');
  configData.push('  - name: out');
  configData.push('    type: Directory');

  return configData.join('\n');
};
