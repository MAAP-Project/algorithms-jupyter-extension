import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ILauncher } from '@jupyterlab/launcher';
import { reactIcon } from '@jupyterlab/ui-components';
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

const listAlgorithmsPlugin: JupyterFrontEndPlugin<void> = {
  id: JUPYTER_EXT.LIST_ALGORITHMS_OPEN_COMMAND,
  description: 'A MAAP JupyterLab plugin for viewing OGC-compliant algorithms.',
  autoStart: true,
  requires: [ILauncher, IFileBrowserFactory],
  activate: (app: JupyterFrontEnd, launcher: ILauncher) => {
    const { commands } = app;
    const command = JUPYTER_EXT.LIST_ALGORITHMS_OPEN_COMMAND;
    let algorithmsWidget: MainAreaWidget<AlgorithmsWidget> | null = null;

    commands.addCommand(command, {
      caption: 'List Algorithms',
      label: 'List Algorithms',
      icon: args => (args['isPalette'] ? undefined : reactIcon),
      execute: () => {
        const content = new AlgorithmsWidget(app);
        algorithmsWidget = new MainAreaWidget<AlgorithmsWidget>({ content });
        algorithmsWidget.title.label = 'List Algorithms';
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
  description:
    'A MAAP JupyterLab plugin for registering OGC-compliant algorithms.',
  autoStart: true,
  optional: [ILauncher],
  requires: [IFileBrowserFactory, IDocumentManager, IDefaultFileBrowser],
  activate: (
    app: JupyterFrontEnd,
    fileBrowser: IDefaultFileBrowser,
    docManager: IDocumentManager
  ) => {
    const { commands } = app;

    let registerAlgorithmsWidget: MainAreaWidget<RegisterAlgorithmsWidget> | null =
      null;

    const command = JUPYTER_EXT.REGISTER_ALGORITHMS_OPEN_COMMAND;

    commands.addCommand(command, {
      caption: 'Register Algorithms',
      label: 'Register Algorithms',
      icon: args => (args['isPalette'] ? undefined : reactIcon),
      execute: () => {
        const content = new RegisterAlgorithmsWidget(
          app,
          fileBrowser,
          docManager
        );
        registerAlgorithmsWidget = new MainAreaWidget<RegisterAlgorithmsWidget>(
          { content }
        );
        registerAlgorithmsWidget.title.label = 'Register Algorithms';
        app.shell.add(registerAlgorithmsWidget, 'main');
      }
    });

    console.log('JupyterLab MAAP plugin register-algorithms is activated!');
  }
};

const buildsDeploymentsPlugin: JupyterFrontEndPlugin<void> = {
  id: JUPYTER_EXT.BUILDS_DEPLOYMENTS_OPEN_COMMAND,
  description:
    'A MAAP JupyterLab plugin for viewing user builds and deployments.',
  autoStart: true,
  requires: [ILauncher, IFileBrowserFactory],
  activate: (app: JupyterFrontEnd, launcher: ILauncher) => {
    const { commands } = app;
    const command = JUPYTER_EXT.BUILDS_DEPLOYMENTS_OPEN_COMMAND;
    let buildsDeploymentsWidget: MainAreaWidget<BuildsDeploymentsWidget> | null =
      null;

    commands.addCommand(command, {
      caption: 'My Builds & Deployments',
      label: 'My Builds & Deployments',
      icon: args => (args['isPalette'] ? undefined : reactIcon),
      execute: () => {
        const content = new BuildsDeploymentsWidget(app);
        buildsDeploymentsWidget = new MainAreaWidget<BuildsDeploymentsWidget>({
          content
        });
        buildsDeploymentsWidget.title.label = 'My Builds & Deployments';
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
  listAlgorithmsPlugin,
  registerAlgorithmsPlugin,
  buildsDeploymentsPlugin
];
