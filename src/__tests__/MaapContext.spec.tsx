import React, { act } from 'react';
import { afterEach, describe, expect, it } from '@jest/globals';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { MaapProvider, MaapSettings, useMaapContext } from '../MaapContext';
import { cleanup, createTestSettings, render } from './testUtils';

type MaapContextValue = ReturnType<typeof useMaapContext>;

// Default for maapApiUrl in schema/plugin.json
const SCHEMA_DEFAULT_API_URL = 'https://api.maap-project.org/';

const SAVED: MaapSettings = {
  maapApiUrl: 'https://api.uat.maap-project.org/',
  maapToken: 'jwt:saved-token',
  defaultAppImage: 'registry.example.com/default:v1',
  currentAppImage: 'registry.example.com/current:v1'
};

type SetterName =
  | 'setMaapApiUrl'
  | 'setMaapToken'
  | 'setDefaultAppImage'
  | 'setCurrentAppImage';

const SETTERS: Array<[SetterName, keyof MaapSettings]> = [
  ['setMaapApiUrl', 'maapApiUrl'],
  ['setMaapToken', 'maapToken'],
  ['setDefaultAppImage', 'defaultAppImage'],
  ['setCurrentAppImage', 'currentAppImage']
];

/**
 * Renders a MaapProvider and returns a getter for the context it provides.
 */
function renderProvider(
  settings: ISettingRegistry.ISettings
): () => MaapContextValue {
  let value: MaapContextValue | null = null;
  const Probe = () => {
    value = useMaapContext();
    return null;
  };
  render(
    <MaapProvider settings={settings}>
      <Probe />
    </MaapProvider>
  );
  return () => value as MaapContextValue;
}

describe('MaapProvider', () => {
  afterEach(cleanup);

  describe('reading settings', () => {
    it('loads the values saved in the user settings on first render', async () => {
      const { settings } = await createTestSettings(SAVED);
      const ctx = renderProvider(settings);

      expect(ctx()).toMatchObject(SAVED);
    });

    it('uses the schema defaults for settings that were never saved', async () => {
      const { settings } = await createTestSettings({});
      const ctx = renderProvider(settings);

      expect(ctx()).toMatchObject({
        maapApiUrl: SCHEMA_DEFAULT_API_URL,
        maapToken: '',
        defaultAppImage: '',
        currentAppImage: ''
      });
    });

    it('falls back to the schema default when a saved value is empty', async () => {
      const { settings } = await createTestSettings({
        ...SAVED,
        maapApiUrl: '',
        maapToken: '   '
      });
      const ctx = renderProvider(settings);

      expect(ctx().maapApiUrl).toBe(SCHEMA_DEFAULT_API_URL);
      expect(ctx().maapToken).toBe('');
      expect(ctx().defaultAppImage).toBe(SAVED.defaultAppImage);
      expect(ctx().currentAppImage).toBe(SAVED.currentAppImage);
    });

    it('getLatestSettings picks up values saved outside the extension', async () => {
      const { settings } = await createTestSettings(SAVED);
      const ctx = renderProvider(settings);

      // e.g. the user edits the token in JupyterLab's Settings Editor
      await settings.set('maapToken', 'jwt:edited');
      const latest = await act(() => ctx().getLatestSettings());

      expect(latest).toEqual({ ...SAVED, maapToken: 'jwt:edited' });
      expect(ctx().maapToken).toBe('jwt:edited');
    });
  });

  describe('saving settings', () => {
    it('saves a new value to the user settings', async () => {
      const { settings, saveCount } = await createTestSettings(SAVED);
      const ctx = renderProvider(settings);

      await act(() => ctx().setMaapToken('jwt:new-token'));

      expect(saveCount()).toBe(1);
      expect(settings.user.maapToken).toBe('jwt:new-token');
      expect(ctx().maapToken).toBe('jwt:new-token');
    });

    it('trims whitespace before saving', async () => {
      const { settings } = await createTestSettings(SAVED);
      const ctx = renderProvider(settings);

      await act(() => ctx().setMaapApiUrl('  https://api.maap-project.org/  '));

      expect(settings.user.maapApiUrl).toBe('https://api.maap-project.org/');
    });

    it('keeps the other saved settings when one is changed', async () => {
      const { settings } = await createTestSettings(SAVED);
      const ctx = renderProvider(settings);

      await act(() =>
        ctx().setDefaultAppImage('registry.example.com/default:v2')
      );

      expect(settings.user).toEqual({
        ...SAVED,
        defaultAppImage: 'registry.example.com/default:v2'
      });
    });

    it.each(SETTERS)(
      '%s never overwrites a saved value with an empty one',
      async (setter, key) => {
        const { settings, saveCount } = await createTestSettings(SAVED);
        const ctx = renderProvider(settings);

        await act(() => ctx()[setter](''));
        await act(() => ctx()[setter]('   '));

        expect(saveCount()).toBe(0);
        expect(settings.user[key]).toBe(SAVED[key]);
        expect(ctx()[key]).toBe(SAVED[key]);
      }
    );
  });
});
