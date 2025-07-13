import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ILauncher } from '@jupyterlab/launcher';
import { reactIcon } from '@jupyterlab/ui-components';
import { MainAreaWidget } from '@jupyterlab/apputils';
import { AlgorithmsWidget, RegisterAlgorithmsWidget } from './widgets';
import { JUPYTER_EXT } from './constants';

/**
 * Initialization data for the maap_algorithms_jupyter_extension extension.
 */
const algorithmsPlugin: JupyterFrontEndPlugin<void> = {
  id: 'maap_algorithms_jupyter_extension:plugin',
  description: 'A JupyterLab extension.',
  autoStart: true,
  requires: [ILauncher],
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

    console.log(
      'JupyterLab extension maap-algorithms-extension is activated!'
    );
  }
};

const registerAlgorithmsPlugin: JupyterFrontEndPlugin<void> = {
  id: JUPYTER_EXT.REGISTER_ALGORITHM_OPEN_COMMAND,
  autoStart: true,
  optional: [ILauncher],
  activate: (app: JupyterFrontEnd, 
             launcher: ILauncher) => {

    const { commands } = app;

    let registerAlgorithmsWidget: MainAreaWidget<RegisterAlgorithmsWidget> | null = null;

    const command = JUPYTER_EXT.REGISTER_ALGORITHM_OPEN_COMMAND;

    commands.addCommand(command, {
      caption: 'Register Algorithms',
      label: 'Register Algorithms',
      icon: args => (args['isPalette'] ? undefined : reactIcon),
      execute: () => {
        const content = new RegisterAlgorithmsWidget(app);
        registerAlgorithmsWidget = new MainAreaWidget<RegisterAlgorithmsWidget>({ content });
        registerAlgorithmsWidget.title.label = 'Algorithms';
        registerAlgorithmsWidget.title.icon = reactIcon;
        app.shell.add(registerAlgorithmsWidget, 'main');
      }
    });

    if (launcher) {
      launcher.add({
        command
      });
    }

    console.log(
      'JupyterLab extension register-algorithms is activated!'
    );
  }
};

export default [algorithmsPlugin, registerAlgorithmsPlugin];
