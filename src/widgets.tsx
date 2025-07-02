import React from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { DataGrid } from './components/DataGrid/DataGrid';

export class AlgorithmsWidget extends ReactWidget {
  jupyterApp: JupyterFrontEnd;
  constructor(jupyterApp: JupyterFrontEnd) {
    super();
    this.jupyterApp = jupyterApp;
  }

  render(): JSX.Element {
    return (
      // <ViewJobsContainer jupyterApp={this.jupyterApp} />
      <DataGrid />
    );
  }
}
