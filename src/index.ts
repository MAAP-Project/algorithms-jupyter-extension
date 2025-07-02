import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ILauncher } from '@jupyterlab/launcher';
import { reactIcon } from '@jupyterlab/ui-components';
import { MainAreaWidget } from '@jupyterlab/apputils';
import { AlgorithmsWidget } from './widgets';

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

export default [algorithmsPlugin];
