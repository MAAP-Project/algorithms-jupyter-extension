import { formatInputRequired, isInputRequired } from '../utils';
import { ProcessInput } from '../../../types/process';

const processInput = (overrides: Partial<ProcessInput> = {}): ProcessInput => ({
  name: 'input_name',
  label: 'Input label',
  description: 'Input description',
  type: 'string',
  placeholder: 'Input label',
  ...overrides
});

describe('isInputRequired', () => {
  it('treats an input as required when optional is false', () => {
    expect(isInputRequired(processInput({ optional: false }))).toBe(true);
  });

  it('treats an input as optional when optional is true', () => {
    expect(isInputRequired(processInput({ optional: true }))).toBe(false);
  });

  it('treats an input as required when optional is not provided', () => {
    expect(isInputRequired(processInput())).toBe(true);
  });
});

describe('formatInputRequired', () => {
  it.each([
    [{ optional: false }, 'Yes'],
    [{ optional: true }, 'No'],
    [{}, 'Yes']
  ])('formats %p as %p', (overrides, expected) => {
    expect(formatInputRequired(processInput(overrides))).toBe(expected);
  });
});
