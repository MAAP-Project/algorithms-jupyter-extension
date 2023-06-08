import { ILauncher } from '@jupyterlab/launcher';
import { treeViewIcon } from '@jupyterlab/ui-components';
import { JUPYTER_EXT } from './constants';
import { 
  ReactAppWidget, 
  RegisterReactAppWidget } from './classes/App';
import { 
  ICommandPalette, 
  MainAreaWidget } from '@jupyterlab/apputils';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin } from '@jupyterlab/application';

/**
 * Initialization data for the algorithms_jupyter_extension extension.
 */
const algo_catalog_plugin: JupyterFrontEndPlugin<void> = {
  id: JUPYTER_EXT.VIEW_ALGORITHMS_PLUGIN_ID,
  autoStart: true,
  optional: [ILauncher, ICommandPalette],
  activate: (app: JupyterFrontEnd, launcher: ILauncher) => {
    const { commands } = app;
    const command = JUPYTER_EXT.VIEW_ALGORITHMS_OPEN_COMMAND;

    commands.addCommand(command, {
      caption: JUPYTER_EXT.VIEW_ALGORITHMS_NAME,
      label: JUPYTER_EXT.VIEW_ALGORITHMS_NAME,
      icon: (args) => (args['isPalette'] ? null : treeViewIcon),
      execute: () => {
        const content = new ReactAppWidget(app);
        const widget = new MainAreaWidget<ReactAppWidget>({ content });
        widget.title.label = JUPYTER_EXT.VIEW_ALGORITHMS_NAME;
        widget.title.icon = treeViewIcon;
        app.shell.add(widget, 'main');
      },
    });

    // if (launcher) {
    //   launcher.add({
    //     command,
    //     category: "MAAP Extensions"
    //   });
    // }

    console.log('JupyterLab view-algorithms plugin is activated!');
  }
};


const algo_reg_plugin: JupyterFrontEndPlugin<void> = {
  id: JUPYTER_EXT.REGISTER_ALGORITHM_PLUGIN_ID,
  autoStart: true,
  optional: [ILauncher, ICommandPalette],
  activate: (app: JupyterFrontEnd, launcher: ILauncher, palette: ICommandPalette) => {
    const { commands } = app;
    const command = JUPYTER_EXT.REGISTER_ALGORITHM_OPEN_COMMAND;

    commands.addCommand(command, {
      caption: JUPYTER_EXT.REGISTER_ALGORITHM_NAME,
      label: JUPYTER_EXT.REGISTER_ALGORITHM_NAME,
      icon: (args) => (args['isPalette'] ? null : treeViewIcon),
      execute: () => {
        const content = new RegisterReactAppWidget("");
        const widget = new MainAreaWidget<RegisterReactAppWidget>({ content });
        widget.title.label = JUPYTER_EXT.REGISTER_ALGORITHM_NAME;
        widget.title.icon = treeViewIcon;
        app.shell.add(widget, 'main');
      },
    });

    if (launcher) {
      launcher.add({
        command,
        category: "MAAP Extensions"
      });
    }

    const category = 'MAAP Extensions'

    palette.addItem({ command: JUPYTER_EXT.REGISTER_ALGORITHM_OPEN_COMMAND, category });

    console.log('JupyterLab register-algorithm plugin is activated!');
  }
};

export default [algo_catalog_plugin, algo_reg_plugin];
