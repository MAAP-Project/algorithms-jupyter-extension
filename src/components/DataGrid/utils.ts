import { ProcessInput } from '../../types/process';

// Inputs are required unless the process explicitly marks them as optional
export const isInputRequired = (input: ProcessInput): boolean =>
  !input.optional;

export const formatInputRequired = (input: ProcessInput): string =>
  isInputRequired(input) ? 'Yes' : 'No';

// Format an input's default value for display. Booleans and 0 must be
// converted explicitly: React renders nothing for true/false, and a
// truthiness check would hide false and 0.
export const formatInputDefault = (input: ProcessInput): string => {
  const value = input.default;
  if (value === undefined || value === null || value === '') {
    return '-';
  }
  if (typeof value === 'object') {
    return value.path ?? '-';
  }
  return String(value);
};
