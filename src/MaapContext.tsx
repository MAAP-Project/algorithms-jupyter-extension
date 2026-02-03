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

type MaapSettings = {
  maapApiUrl: string;
  maapToken: string;
};

interface IMaapContextType extends MaapSettings {
  setMaapApiUrl: (url: string) => Promise<void>;
  setMaapToken: (token: string) => Promise<void>;

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
  maapApiUrl: 'api.uat1.maap-project.org',
  maapToken: ''
};

export const MaapProvider: React.FC<IMaapProviderProps> = ({
  children,
  settings
}) => {
  const [state, setState] = useState<MaapSettings>(DEFAULTS);

  // Load initial values from settings once on mount
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const apiUrlRes = await settings.get('maapApiUrl');
        const tokenRes = await settings.get('maapToken');

        const maapApiUrl =
          (apiUrlRes.composite as string) ?? DEFAULTS.maapApiUrl;
        const maapToken = (tokenRes.composite as string) ?? DEFAULTS.maapToken;

        if (!cancelled) {
          setState({ maapApiUrl, maapToken });
        }
      } catch (err) {
        console.error('Failed to load MAAP settings:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [settings]);

  const setMaapApiUrl = useCallback(
    async (maapApiUrl: string) => {
      await settings.set('maapApiUrl', maapApiUrl);
      // Keep local state consistent for UI consumers
      setState(prev => ({ ...prev, maapApiUrl }));
    },
    [settings]
  );

  const setMaapToken = useCallback(
    async (maapToken: string) => {
      await settings.set('maapToken', maapToken);
      // Keep local state consistent for UI consumers
      setState(prev => ({ ...prev, maapToken }));
    },
    [settings]
  );

  const getLatestSettings = useCallback(async (): Promise<MaapSettings> => {
    const apiUrlRes = await settings.get('maapApiUrl');
    const tokenRes = await settings.get('maapToken');

    const maapApiUrl = (apiUrlRes.composite as string) ?? DEFAULTS.maapApiUrl;
    const maapToken = (tokenRes.composite as string) ?? DEFAULTS.maapToken;

    // Optional: update local state so UI reflects latest values
    setState({ maapApiUrl, maapToken });

    return { maapApiUrl, maapToken };
  }, [settings]);

  const value = useMemo<IMaapContextType>(
    () => ({
      ...state,
      setMaapApiUrl,
      setMaapToken,
      getLatestSettings,
      settings
    }),
    [state, setMaapApiUrl, setMaapToken, getLatestSettings, settings]
  );

  return <MaapContext.Provider value={value}>{children}</MaapContext.Provider>;
};
