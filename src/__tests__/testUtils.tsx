import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { jest } from '@jest/globals';
import { ISettingRegistry, SettingRegistry } from '@jupyterlab/settingregistry';

// Tell React this is a test environment so act() flushes updates quietly
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const PLUGIN_ID = 'maap_algorithms_jupyter_extension:plugin';

// The real settings schema, so tests get the same defaults as JupyterLab
const schema = jest.requireActual<ISettingRegistry.ISchema>(
  '../../schema/plugin.json'
);

export interface ITestSettings {
  settings: ISettingRegistry.ISettings;
  /**
   * Number of times the settings were written to storage.
   */
  saveCount: () => number;
}

/**
 * Loads the extension settings through a real SettingRegistry backed by an
 * in-memory store, starting from `saved` as the user's saved settings.
 */
export async function createTestSettings(
  saved: Record<string, string> = {}
): Promise<ITestSettings> {
  let raw = JSON.stringify(saved);
  let saves = 0;

  const registry = new SettingRegistry({
    connector: {
      fetch: async (id: string) => ({
        id,
        schema,
        raw,
        data: { composite: {}, user: {} },
        version: 'test'
      }),
      list: async () => ({ ids: [], values: [] }),
      save: async (id: string, value: string) => {
        raw = value;
        saves++;
      },
      remove: async () => undefined
    }
  });

  const settings = await registry.load(PLUGIN_ID);
  return { settings, saveCount: () => saves };
}

const mounted: Array<{ root: Root; container: HTMLElement }> = [];

export function render(element: React.ReactElement): void {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(element));
  mounted.push({ root, container });
}

export function cleanup(): void {
  for (const { root, container } of mounted.splice(0)) {
    act(() => root.unmount());
    container.remove();
  }
}

/**
 * Runs `action`, then waits for any async work it started (such as saving
 * settings) to finish before returning.
 */
export async function actAsync(
  action: () => void = () => undefined
): Promise<void> {
  await act(async () => {
    action();
    await new Promise(resolve => setTimeout(resolve, 0));
  });
}

/**
 * Types into a React-controlled input, replacing its current value.
 */
export function typeInto(input: HTMLInputElement, value: string): void {
  // React ignores a plain `input.value = ...`, so use the native setter
  const setValue = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value'
  )?.set;
  act(() => {
    setValue?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

export function pressEnter(element: HTMLElement): void {
  element.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
  );
}

export function getButton(label: string): HTMLButtonElement {
  const button = Array.from(document.querySelectorAll('button')).find(
    b => b.textContent === label
  );
  if (!button) {
    throw new Error(`No button labelled "${label}"`);
  }
  return button;
}
