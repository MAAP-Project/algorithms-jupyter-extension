import { JUPYTER_EXT } from '../constants';
import { Notification } from '@jupyterlab/apputils';

export const openRegisterAlgorithm = (jupyterApp, data) => {
  if (
    jupyterApp.commands.hasCommand(JUPYTER_EXT.REGISTER_ALGORITHMS_OPEN_COMMAND)
  ) {
    if (data === null) {
      jupyterApp.commands.execute(
        JUPYTER_EXT.REGISTER_ALGORITHMS_OPEN_COMMAND,
        null
      );
    } else {
      jupyterApp.commands.execute(
        JUPYTER_EXT.REGISTER_ALGORITHMS_OPEN_COMMAND,
        data
      );
    }
  }
};

export const createFile = async (
  fileContent: string,
  filePath: string,
  jupyterApp
) => {
  try {
    const contents = jupyterApp.serviceManager.contents;
    await contents.save(filePath, {
      type: 'file',
      format: 'text',
      content: fileContent
    });
    Notification.success(`File saved to workspace: ${filePath}`, {
      autoClose: false
    });
  } catch (error) {
    console.error('Error saving YAML file to workspace:', error);
    Notification.error('Error saving file to workspace.', { autoClose: false });
  }
};

export const createDirectory = async (path: string, jupyterApp) => {
  try {
    const contents = jupyterApp.serviceManager.contents;
    await contents.save(path, {
      type: 'directory'
    });
    return path;
  } catch (error) {
    console.error('Error creating directory:', error);
  }
};
