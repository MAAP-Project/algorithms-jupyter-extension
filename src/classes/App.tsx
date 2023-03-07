import React from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { Provider } from 'react-redux';
import { EXTENSION_CSS_CLASSNAME } from '../constants';
import store from '../redux/store';
import 'regenerator-runtime/runtime';
import { AlgorithmsApp } from '../components/AlgorithmsApp';

export class ReactAppWidget extends ReactWidget {
  uname: string
  constructor(uname: string) {
    super()
    this.addClass(EXTENSION_CSS_CLASSNAME)
    this.uname = uname
  }

  render(): JSX.Element {
    return (
      <Provider store={store}>
        <AlgorithmsApp uname={this.uname}/>
      </Provider>
    )
  }
}
