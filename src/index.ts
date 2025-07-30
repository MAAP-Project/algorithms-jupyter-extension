import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ILauncher } from '@jupyterlab/launcher';
import { reactIcon } from '@jupyterlab/ui-components';
import { MainAreaWidget } from '@jupyterlab/apputils';
import { AlgorithmsWidget, RegisterAlgorithmsWidget } from './widgets';
import { JUPYTER_EXT } from './constants';
import {
  FileDialog,
  IDefaultFileBrowser,
  IFileBrowserFactory
} from '@jupyterlab/filebrowser';
import { IDocumentManager } from '@jupyterlab/docmanager';

/**
 * Initialization data for the maap_algorithms_jupyter_extension extension.
 */
const algorithmsPlugin: JupyterFrontEndPlugin<void> = {
  id: 'maap_algorithms_jupyter_extension:plugin',
  description: 'A JupyterLab extension.',
  autoStart: true,
  requires: [ILauncher, IFileBrowserFactory],
  activate: (app: JupyterFrontEnd, launcher: ILauncher) => {
    const { commands } = app;
    const command = 'algorithms-widget';
    let algorithmsWidget: MainAreaWidget<AlgorithmsWidget> | null = null;

    commands.addCommand(command, {
      caption: 'Algorithms',
      label: 'Algorithms',
      icon: args => (args['isPalette'] ? undefined : reactIcon),
      execute: () => {
        const content = new AlgorithmsWidget(app);
        algorithmsWidget = new MainAreaWidget<AlgorithmsWidget>({ content });
        algorithmsWidget.title.label = 'Algorithms';
        algorithmsWidget.title.icon = reactIcon;
        app.shell.add(algorithmsWidget, 'main');
      }
    });

    if (launcher) {
      launcher.add({
        command
      });
    }

    console.log('JupyterLab extension maap-algorithms-extension is activated!');
  }
};

const registerAlgorithmsPlugin: JupyterFrontEndPlugin<void> = {
  id: JUPYTER_EXT.REGISTER_ALGORITHM_OPEN_COMMAND,
  autoStart: true,
  optional: [ILauncher],
  requires: [IFileBrowserFactory, IDocumentManager, IDefaultFileBrowser],
  activate: (
    app: JupyterFrontEnd,
    fileBrowser: IDefaultFileBrowser,
    docManager: IDocumentManager,
    fileBrowserFactory: IFileBrowserFactory
  ) => {
    const { commands } = app;

    let registerAlgorithmsWidget: MainAreaWidget<RegisterAlgorithmsWidget> | null =
      null;

    const command = JUPYTER_EXT.REGISTER_ALGORITHM_OPEN_COMMAND;

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
        registerAlgorithmsWidget.title.label = 'Algorithm Registration';
        registerAlgorithmsWidget.title.icon = reactIcon;
        app.shell.add(registerAlgorithmsWidget, 'main');
      }
    });

    app.commands.addCommand('file-dialog', {
      label: 'file dialog',
      execute: async () => {
        const { contents } = app.serviceManager;
        console.log('File browser:', docManager);
        const result = await FileDialog.getOpenFiles({
          manager: docManager,
          title: 'file dialog',
          filter: model => {
            if (model.type !== 'file') {
              return null;
            }
            const name = model.name.toLowerCase();
            const isConfigFile =
              name.endsWith('.json') ||
              name.endsWith('.yaml') ||
              name.endsWith('.yml') ||
              name.endsWith('.txt') ||
              name.endsWith('.cfg') ||
              name.endsWith('.conf');
            return isConfigFile ? { score: 1 } : null;
          }
        });
        if (result.button.accept) {
          const files = result.value;
          console.log('Files:', files);
        }
      }
    });

    // if (launcher) {
    //   launcher.add({
    //     command
    //   });
    // }

    console.log('JupyterLab extension register-algorithms is activated!');
  }
};

export default [algorithmsPlugin, registerAlgorithmsPlugin];
