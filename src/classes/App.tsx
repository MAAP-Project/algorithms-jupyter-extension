import React from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { Provider } from 'react-redux';
import { JUPYTER_EXT } from '../constants';
import store from '../redux/store';
import 'regenerator-runtime/runtime';
import { AlgorithmsApp } from '../components/AlgorithmsApp';
import { RegistrationForm } from '../components/RegistrationForm';
import { JupyterFrontEnd } from '@jupyterlab/application';

export class ReactAppWidget extends ReactWidget {
  jupyterApp: JupyterFrontEnd
  constructor(jupyterApp: JupyterFrontEnd) {
    super()
    this.addClass(JUPYTER_EXT.EXTENSION_CSS_CLASSNAME)
    this.jupyterApp = jupyterApp
  }

  render(): JSX.Element {
    return (
      <Provider store={store}>
        <AlgorithmsApp jupyterApp={this.jupyterApp}/>
      </Provider>
    )
  }
}

export class RegisterReactAppWidget extends ReactWidget {
  uname: any
  constructor(uname: any) {
    super()
    this.addClass(JUPYTER_EXT.EXTENSION_CSS_CLASSNAME)
  }

  render(): JSX.Element {
    return (
      <Provider store={store}>
        <RegistrationForm />
      </Provider>
    )
  }
}
