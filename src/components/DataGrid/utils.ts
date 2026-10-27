import { ProcessInput } from '../../types/process';

// Inputs are required unless the process explicitly marks them as optional
export const isInputRequired = (input: ProcessInput): boolean =>
  !input.optional;

export const formatInputRequired = (input: ProcessInput): string =>
  isInputRequired(input) ? 'Yes' : 'No';
