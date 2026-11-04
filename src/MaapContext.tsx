import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
  useCallback,
  useEffect
} from 'react';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

export type MaapSettings = {
  maapApiUrl: string;
  maapToken: string;
  defaultAppImage: string;
  currentAppImage: string;
};

interface IMaapContextType extends MaapSettings {
  setMaapApiUrl: (url: string) => Promise<void>;
  setMaapToken: (token: string) => Promise<void>;
  setDefaultAppImage: (image: string) => Promise<void>;
  setCurrentAppImage: (image: string) => Promise<void>;

  /**
   * Reads settings from the JupyterLab SettingRegistry right now and returns them.
   * Use this when you need the latest values immediately before making API calls.
   */
  getLatestSettings: () => Promise<MaapSettings>;

  /**
   * Expose settings instance in case callers need it.
   */
  settings: ISettingRegistry.ISettings;
}

const MaapContext = createContext<IMaapContextType | null>(null);

export function useMaapContext(): IMaapContextType {
  const ctx = useContext(MaapContext);
  if (!ctx) {
    throw new Error('useMaapContext must be used within a MaapProvider');
  }
  return ctx;
}

interface IMaapProviderProps {
  children: ReactNode;
  settings: ISettingRegistry.ISettings;
}

const DEFAULTS: MaapSettings = {
  maapApiUrl: '',
  maapToken: '',
  defaultAppImage: '',
  currentAppImage: ''
};

/**
 * Reads a single setting, preferring the value saved in the user settings.
 * An empty saved value falls back to the schema default rather than masking it.
 */
function readSetting(
  settings: ISettingRegistry.ISettings,
  key: keyof MaapSettings
): string {
  const { user } = settings.get(key);
  if (typeof user === 'string' && user.trim() !== '') {
    return user;
  }
  const schemaDefault = settings.default(key);
  return typeof schemaDefault === 'string' ? schemaDefault : DEFAULTS[key];
}

function readSettings(settings: ISettingRegistry.ISettings): MaapSettings {
  return {
    maapApiUrl: readSetting(settings, 'maapApiUrl'),
    maapToken: readSetting(settings, 'maapToken'),
    defaultAppImage: readSetting(settings, 'defaultAppImage'),
    currentAppImage: readSetting(settings, 'currentAppImage')
  };
}

export const MaapProvider: React.FC<IMaapProviderProps> = ({
  children,
  settings
}) => {
  const [state, setState] = useState<MaapSettings>(() =>
    readSettings(settings)
  );

  useEffect(() => {
    setState(readSettings(settings));
  }, [settings]);

  /**
   * Saves a setting to the user settings. Empty values are ignored so an
   * existing user setting is never overwritten with an empty value.
   */
  const saveSetting = useCallback(
    async (key: keyof MaapSettings, value: string) => {
      const trimmed = value.trim();
      if (!trimmed) {
        return;
      }
      await settings.set(key, trimmed);
      // Keep local state consistent for UI consumers
      setState(prev => ({ ...prev, [key]: trimmed }));
    },
    [settings]
  );

  const setMaapApiUrl = useCallback(
    (maapApiUrl: string) => saveSetting('maapApiUrl', maapApiUrl),
    [saveSetting]
  );

  const setDefaultAppImage = useCallback(
    (defaultAppImage: string) =>
      saveSetting('defaultAppImage', defaultAppImage),
    [saveSetting]
  );

  const setCurrentAppImage = useCallback(
    (currentAppImage: string) =>
      saveSetting('currentAppImage', currentAppImage),
    [saveSetting]
  );

  const setMaapToken = useCallback(
    (maapToken: string) => saveSetting('maapToken', maapToken),
    [saveSetting]
  );

  const getLatestSettings = useCallback(async (): Promise<MaapSettings> => {
    const latest = readSettings(settings);

    // Update local state so UI reflects latest values
    setState(latest);

    return latest;
  }, [settings]);

  const value = useMemo<IMaapContextType>(
    () => ({
      ...state,
      setMaapApiUrl,
      setMaapToken,
      setDefaultAppImage,
      setCurrentAppImage,
      getLatestSettings,
      settings
    }),
    [
      state,
      setMaapApiUrl,
      setMaapToken,
      setDefaultAppImage,
      setCurrentAppImage,
      getLatestSettings,
      settings
    ]
  );

  return <MaapContext.Provider value={value}>{children}</MaapContext.Provider>;
};
