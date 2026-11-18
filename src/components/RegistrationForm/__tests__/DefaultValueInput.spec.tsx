import React from 'react';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { DefaultValueInput } from '../DefaultValueInput';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const render = (
  type: string,
  value: string | number = '',
  onChange: (value: string) => void = jest.fn()
) => {
  act(() => {
    root.render(
      <DefaultValueInput
        name="input_row-1_default"
        type={type}
        value={value}
        onChange={onChange}
      />
    );
  });
  return container.querySelector('[name="input_row-1_default"]') as
    | HTMLInputElement
    | HTMLSelectElement;
};

// Set a value the way React expects so its onChange handler fires.
const changeValue = (
  element: HTMLInputElement | HTMLSelectElement,
  value: string
) => {
  const proto = Object.getPrototypeOf(element);
  Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(element, value);
  act(() => {
    element.dispatchEvent(
      new Event(element.tagName === 'SELECT' ? 'change' : 'input', {
        bubbles: true
      })
    );
  });
};

describe('DefaultValueInput', () => {
  it.each(['string', 'File', 'Directory', ''])(
    'renders a text field for type %p',
    type => {
      const element = render(type);
      expect(element.tagName).toBe('INPUT');
      expect((element as HTMLInputElement).type).toBe('text');
    }
  );

  it.each(['int', 'long'])('renders a whole-number field for type %p', type => {
    const element = render(type) as HTMLInputElement;
    expect(element.tagName).toBe('INPUT');
    expect(element.type).toBe('number');
    expect(element.step).toBe('1');
  });

  it.each(['float', 'double'])(
    'renders a decimal number field for type %p',
    type => {
      const element = render(type) as HTMLInputElement;
      expect(element.tagName).toBe('INPUT');
      expect(element.type).toBe('number');
      expect(element.step).toBe('any');
    }
  );

  it('renders a true/false dropdown for boolean inputs', () => {
    const element = render('boolean') as HTMLSelectElement;
    expect(element.tagName).toBe('SELECT');
    expect(Array.from(element.options).map(o => o.value)).toEqual([
      '',
      'true',
      'false'
    ]);
    expect(element.value).toBe('');
  });

  it('shows the current value', () => {
    expect(render('int', '10').value).toBe('10');
    expect(render('boolean', 'false').value).toBe('false');
    expect(render('string', 'hello').value).toBe('hello');
  });

  it.each([
    ['string', 'hello'],
    ['int', '42'],
    ['float', '0.5'],
    ['boolean', 'true']
  ])('reports changes for type %p', (type, value) => {
    const onChange = jest.fn();
    changeValue(render(type, '', onChange), value);
    expect(onChange).toHaveBeenCalledWith(value);
  });
});
