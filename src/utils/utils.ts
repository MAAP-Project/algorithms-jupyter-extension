import { JUPYTER_EXT } from '../constants';

export const openRegisterAlgorithm = (jupyterApp, data) => {
  if (
    jupyterApp.commands.hasCommand(JUPYTER_EXT.REGISTER_ALGORITHM_OPEN_COMMAND)
  ) {
    if (data === null) {
      jupyterApp.commands.execute(
        JUPYTER_EXT.REGISTER_ALGORITHM_OPEN_COMMAND,
        null
      );
    } else {
      jupyterApp.commands.execute(
        JUPYTER_EXT.REGISTER_ALGORITHM_OPEN_COMMAND,
        data
      );
    }
  }
};
