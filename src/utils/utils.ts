import { FORM_FIELDS, JUPYTER_EXT } from '../constants';
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

export const getJSFromPythonName = (pythonName: string) => {
  const formFields = Object.values(FORM_FIELDS);
  const formField = formFields.find(
    field => field.pythonic_name === pythonName
  );
  if (!formField || !formField.name) {
    console.warn(`Form field not found for ${pythonName}`);
    return '';
  }
  return formField.name;
};

export const getPythonFromJSName = (jsName: string) => {
  const pythonName = FORM_FIELDS[jsName]?.pythonic_name;
  if (!pythonName) {
    console.warn(`Form field not found for ${jsName}`);
    return '';
  }
  return pythonName;
};
