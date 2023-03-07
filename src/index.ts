import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the algorithms_jupyter_extension extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'algorithms_jupyter_extension:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension algorithms_jupyter_extension is activated!');
  }
};

export default plugin;
