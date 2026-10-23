import * as yaml from 'yaml';
import {
  buildAlgorithmConfig,
  configInputToInputRow,
  inputRowToConfigInput,
  parseInputDefault
} from '../utils';
import { AlgorithmConfigInput } from '../../../types/algorithmConfig';
import { AlgorithmData, AlgorithmInputRow } from '../../../types/registration';

const baseAlgorithmData = (): AlgorithmData => ({
  algorithmName: 'test-algorithm',
  algorithmVersion: 'main',
  algorithmDescription: 'Test algorithm',
  codeRepository: 'https://github.com/MAAP-Project/test-algorithm.git',
  runCommand: 'test-algorithm/run.sh',
  ramMin: 5,
  coresMin: 1,
  buildCommand: 'test-algorithm/build.sh',
  baseContainerURL: 'ghcr.io/maap-project/maap-base:latest',
  algorithmContainerURL: '',
  author: 'MAAP',
  contributor: '',
  license: '',
  releaseNotes: '',
  citation: '',
  keywords: '',
  inputs: []
});

const inputRow = (
  overrides: Partial<AlgorithmInputRow> = {}
): AlgorithmInputRow => ({
  id: 'row-1',
  name: 'input_name',
  label: 'Input label',
  description: 'Input description',
  type: 'string',
  default: '',
  required: true,
  ...overrides
});

const buildConfigInputs = (rows: AlgorithmInputRow[]) => {
  const data = baseAlgorithmData();
  data.inputs = rows.map(inputRowToConfigInput);
  const content = buildAlgorithmConfig(data);
  expect(content).not.toBe('');
  return yaml.parse(content).inputs as AlgorithmConfigInput[];
};

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
  window.alert = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('parseInputDefault', () => {
  it.each([
    ['0', 'int', 0],
    ['0', 'long', 0],
    ['0', 'float', 0],
    ['0.0', 'double', 0],
    ['0', 'int?', 0],
    ['False', 'boolean', false],
    ['false', 'boolean', false],
    ['FALSE', 'boolean?', false],
    ['True', 'boolean', true],
    ['0', 'string', '0'],
    ['False', 'string', 'False'],
    ['abc', 'int', 'abc'],
    ['', 'int', ''],
    ['   ', 'string', ''],
    [undefined, 'string', ''],
    [null, 'string', ''],
    [0, 'int', 0],
    [false, 'boolean', false]
  ])('parses %p with type %p as %p', (value, type, expected) => {
    expect(parseInputDefault(value, type)).toBe(expected);
  });
});

describe('buildAlgorithmConfig', () => {
  it('preserves falsy defaults for required inputs', () => {
    const inputs = buildConfigInputs([
      inputRow({ name: 'count', type: 'int', default: '0' }),
      inputRow({ name: 'scale', type: 'float', default: '0' }),
      inputRow({ name: 'verbose', type: 'boolean', default: 'False' }),
      inputRow({ name: 'label', type: 'string', default: '0' })
    ]);

    expect(inputs.map(input => input.default)).toEqual([0, 0, false, '0']);
  });

  it('omits the default when none is provided', () => {
    const [input] = buildConfigInputs([inputRow({ type: 'int', default: '' })]);

    expect(input).not.toHaveProperty('default');
  });

  it('generates a valid config with required and optional inputs', () => {
    const inputs = buildConfigInputs([
      inputRow({ name: 'granule', type: 'File', default: '' }),
      inputRow({ name: 'iterations', type: 'int', default: '10' }),
      inputRow({ name: 'bbox', type: 'string', required: false }),
      inputRow({
        name: 'threshold',
        type: 'float',
        required: false,
        default: '0.5'
      })
    ]);

    expect(inputs).toEqual([
      {
        name: 'granule',
        label: 'Input label',
        doc: 'Input description',
        type: 'File'
      },
      {
        name: 'iterations',
        label: 'Input label',
        doc: 'Input description',
        type: 'int',
        default: 10
      },
      {
        name: 'bbox',
        label: 'Input label',
        doc: 'Input description',
        type: 'string?'
      },
      {
        // Defaults are not captured for optional inputs
        name: 'threshold',
        label: 'Input label',
        doc: 'Input description',
        type: 'float?'
      }
    ]);
    inputs.forEach(input => expect(input).not.toHaveProperty('required'));
  });

  it('returns an empty string for an invalid config', () => {
    const data = baseAlgorithmData();
    data.algorithmName = 'Invalid Name';
    data.inputs = [inputRowToConfigInput(inputRow())];

    expect(buildAlgorithmConfig(data)).toBe('');
  });
});

describe('configInputToInputRow', () => {
  it('loads a required input', () => {
    expect(
      configInputToInputRow({
        name: 'granule',
        label: 'Granule',
        doc: 'Input granule',
        type: 'File'
      })
    ).toEqual({
      name: 'granule',
      label: 'Granule',
      description: 'Input granule',
      type: 'File',
      default: '',
      required: true
    });
  });

  it('loads an optional input and strips the trailing ?', () => {
    expect(
      configInputToInputRow({
        name: 'bbox',
        label: 'Bounding box',
        doc: 'Bounding box',
        type: 'string?'
      })
    ).toEqual({
      name: 'bbox',
      label: 'Bounding box',
      description: 'Bounding box',
      type: 'string',
      default: '',
      required: false
    });
  });

  it.each([
    [0, 'int', '0'],
    [false, 'boolean', 'false'],
    [0.5, 'float', '0.5'],
    ['abc', 'string', 'abc']
  ])('loads a default of %p (type %p) as %p', (value, type, expected) => {
    const row = configInputToInputRow({
      name: 'input',
      label: 'Input',
      doc: 'Input',
      type,
      default: value
    });
    expect(row.default).toBe(expected);
    expect(row.required).toBe(true);
  });

  it('round-trips a loaded config back to the same inputs', () => {
    const original = buildConfigInputs([
      inputRow({ name: 'count', type: 'int', default: '0' }),
      inputRow({ name: 'verbose', type: 'boolean', default: 'false' }),
      inputRow({ name: 'bbox', type: 'string', required: false })
    ]);

    const reloaded = buildConfigInputs(
      original.map((input, i) => ({
        id: `row-${i}`,
        ...configInputToInputRow(input)
      }))
    );

    expect(reloaded).toEqual(original);
  });
});
