import { AlgorithmConfigInput } from '../../types/algorithmConfig';
import { AlgorithmData } from '../../types/registration';

export const formatAlgorithmData = (data: AlgorithmData): string => {
  const configData: string[] = [];

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
  if (data.baseCommand) {
    configData.push(`base_command: ${data.baseCommand}`);
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
  if (data.containerURL) {
    configData.push(`container_url: ${data.containerURL}`);
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
