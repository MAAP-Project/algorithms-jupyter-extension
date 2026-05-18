import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ILauncher } from '@jupyterlab/launcher';
import { MainAreaWidget } from '@jupyterlab/apputils';
import {
  AlgorithmsWidget,
  RegisterAlgorithmsWidget,
  BuildsDeploymentsWidget
} from './widgets';
import { JUPYTER_EXT } from './constants';
import {
  IDefaultFileBrowser,
  IFileBrowserFactory
} from '@jupyterlab/filebrowser';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { Token } from '@lumino/coreutils';
import { maapIcon } from './icons/icons';

const sharedSettingsPluginId = 'maap-jupyter-server-extension:plugin';
const algorithmsSettingsPluginId = 'maap_algorithms_jupyter_extension:plugin';

export interface ISettingsResolver {
  pluginId: string;
  settings: ISettingRegistry.ISettings;
  get<T = unknown>(key: string, fallback?: T): T;
}

export const ISettingsResolver = new Token<ISettingsResolver>(
  'jupyterlab:ISettingsResolver'
);

/**
 * The MAAP Jupyter shared settings will attempt to be loaded first. If these
 * settings do not exist, the shared settings for this collection of algorithm
 * plugins will be loaded instead.
 */
const settingsResolverPlugin: JupyterFrontEndPlugin<ISettingsResolver> = {
  id: 'jupyterlab:settings-resolver',
  autoStart: true,
  requires: [ISettingRegistry],
  provides: ISettingsResolver,
  activate: async (app: JupyterFrontEnd, registry: ISettingRegistry) => {
    let loadedId = sharedSettingsPluginId;
    let settings: ISettingRegistry.ISettings;

    try {
      settings = await registry.load(loadedId);
    } catch (err) {
      console.warn(`Did not load settings for "${loadedId}: ", ${err}`);

      loadedId = algorithmsSettingsPluginId;

      try {
        settings = await registry.load(loadedId);
      } catch (err2) {
        console.error(`Failed to load fallback settings "${loadedId}"`, err2);
        throw err2;
      }
    }

    console.log(`Settings loaded from: ${loadedId}`);

    return {
      pluginId: loadedId,
      settings,
      get: <T = unknown>(key: string, fallback?: T) => {
        const v = settings.get(key).composite as T;
        return (v ?? fallback) as T;
      }
    };
  }
};

const listAlgorithmsPlugin: JupyterFrontEndPlugin<void> = {
  id: JUPYTER_EXT.LIST_ALGORITHMS_OPEN_COMMAND,
  description: 'A MAAP JupyterLab plugin for viewing OGC-compliant algorithms.',
  autoStart: true,
  requires: [ILauncher, ISettingsResolver],
  activate: async (
    app: JupyterFrontEnd,
    launcher: ILauncher,
    settingRegistry: ISettingsResolver
  ) => {
    const { commands } = app;
    const command = JUPYTER_EXT.LIST_ALGORITHMS_OPEN_COMMAND;
    let algorithmsWidget: MainAreaWidget<AlgorithmsWidget> | null = null;

    commands.addCommand(command, {
      caption: 'Algorithm Catalog',
      label: 'Algorithm Catalog',
      icon: args => (args['isPalette'] ? undefined : maapIcon),
      execute: () => {
        const content = new AlgorithmsWidget(app, settingRegistry.settings);
        algorithmsWidget = new MainAreaWidget<AlgorithmsWidget>({ content });
        algorithmsWidget.title.label = 'Algorithm Catalog';
        algorithmsWidget.title.icon = maapIcon;
        app.shell.add(algorithmsWidget, 'main');
      }
    });

    if (launcher) {
      launcher.add({
        command,
        category: 'MAAP Plugins'
      });
    }

    console.log('JupyterLab MAAP plugin list-algorithms is activated!');
  }
};

const registerAlgorithmsPlugin: JupyterFrontEndPlugin<void> = {
  id: JUPYTER_EXT.REGISTER_ALGORITHMS_OPEN_COMMAND,
  description: 'A MAAP JupyterLab plugin for registering OGC algorithms.',
  autoStart: true,
  requires: [
    IFileBrowserFactory,
    IDocumentManager,
    ISettingsResolver,
    ILauncher
  ],
  activate: async (
    app: JupyterFrontEnd,
    fileBrowser: IDefaultFileBrowser,
    docManager: IDocumentManager,
    settingRegistry: ISettingsResolver,
    launcher: ILauncher
  ) => {
    const { commands } = app;

    let registerAlgorithmsWidget: MainAreaWidget<RegisterAlgorithmsWidget> | null =
      null;

    const command = JUPYTER_EXT.REGISTER_ALGORITHMS_OPEN_COMMAND;

    commands.addCommand(command, {
      caption: 'Register Algorithms',
      label: 'Register Algorithms',
      icon: args => (args['isPalette'] ? undefined : maapIcon),
      execute: () => {
        const content = new RegisterAlgorithmsWidget(
          app,
          fileBrowser,
          docManager,
          settingRegistry.settings
        );
        registerAlgorithmsWidget = new MainAreaWidget<RegisterAlgorithmsWidget>(
          { content }
        );
        registerAlgorithmsWidget.title.label = 'Register Algorithms';
        registerAlgorithmsWidget.title.icon = maapIcon;
        app.shell.add(registerAlgorithmsWidget, 'main');
      }
    });

    if (launcher) {
      launcher.add({
        command,
        category: 'MAAP Plugins'
      });
    }

    console.log('JupyterLab MAAP plugin register-algorithms is activated!');
  }
};

const buildsDeploymentsPlugin: JupyterFrontEndPlugin<void> = {
  id: JUPYTER_EXT.BUILDS_DEPLOYMENTS_OPEN_COMMAND,
  description:
    'A MAAP JupyterLab plugin for viewing user builds and deployments.',
  autoStart: true,
  requires: [ILauncher, ISettingsResolver],
  activate: async (
    app: JupyterFrontEnd,
    launcher: ILauncher,
    settingRegistry: ISettingsResolver
  ) => {
    const { commands } = app;

    const command = JUPYTER_EXT.BUILDS_DEPLOYMENTS_OPEN_COMMAND;
    let buildsDeploymentsWidget: MainAreaWidget<BuildsDeploymentsWidget> | null =
      null;

    commands.addCommand(command, {
      caption: 'My Builds & Deployments',
      label: 'My Builds & Deployments',
      icon: args => (args['isPalette'] ? undefined : maapIcon),
      execute: () => {
        const content = new BuildsDeploymentsWidget(
          app,
          settingRegistry.settings
        );
        buildsDeploymentsWidget = new MainAreaWidget<BuildsDeploymentsWidget>({
          content
        });
        buildsDeploymentsWidget.title.label = 'My Builds & Deployments';
        buildsDeploymentsWidget.title.icon = maapIcon;
        app.shell.add(buildsDeploymentsWidget, 'main');
      }
    });

    if (launcher) {
      launcher.add({
        command,
        category: 'MAAP Plugins'
      });
    }

    console.log('JupyterLab MAAP plugin builds-deployments is activated!');
  }
};

export default [
  settingsResolverPlugin,
  listAlgorithmsPlugin,
  registerAlgorithmsPlugin,
  buildsDeploymentsPlugin
];
