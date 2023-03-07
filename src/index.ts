import { IStateDB } from '@jupyterlab/statedb';
import { ILauncher } from '@jupyterlab/launcher';
import { reactIcon } from '@jupyterlab/ui-components';
import { ReactAppWidget } from './classes/App';
import { 
  ICommandPalette, 
  MainAreaWidget } from '@jupyterlab/apputils';
import { 
  EXTENSION_ID, 
  EXTENSION_NAME, 
  OPEN_COMMAND } from './constants';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the algorithms_jupyter_extension extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: EXTENSION_ID,
  autoStart: true,
  optional: [ILauncher, ICommandPalette, IStateDB],
  activate: (app: JupyterFrontEnd, launcher: ILauncher) => {
    const { commands } = app;
    const command = OPEN_COMMAND;
    commands.addCommand(command, {
      caption: 'Algorithms',
      label: EXTENSION_NAME,
      // icon: (args) => (args['isPalette'] ? null : reactIcon),
      execute: () => {
        const content = new ReactAppWidget("username");
        const widget = new MainAreaWidget<ReactAppWidget>({ content });
        widget.title.label = EXTENSION_NAME;
        widget.title.icon = reactIcon;
        app.shell.add(widget, 'main');
        // getUsernameToken(state, profileId, function (uname: string, ticket: string) {
        //   console.log("Got username: ", uname)
        //   const content = new ReactAppWidget(uname);
        //   const widget = new MainAreaWidget<ReactAppWidget>({ content });
        //   widget.title.label = EXTENSION_NAME;
        //   widget.title.icon = reactIcon;
        //   app.shell.add(widget, 'main');
        // });

      },
    });

    if (launcher) {
      launcher.add({
        command,
      });
    }

    console.log('JupyterLab extension algorithms_jupyter_extension is activated!');
  }
};

export default plugin;
