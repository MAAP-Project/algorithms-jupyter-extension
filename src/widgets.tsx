import React from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { DataGrid } from './components/DataGrid/DataGrid';
import { RegistrationForm } from './components/RegistrationForm/RegistrationForm';

export class AlgorithmsWidget extends ReactWidget {
  jupyterApp: JupyterFrontEnd;
  constructor(jupyterApp: JupyterFrontEnd) {
    super();
    this.jupyterApp = jupyterApp;
  }

  render(): JSX.Element {
    return (
      // <ViewJobsContainer jupyterApp={this.jupyterApp} />
      <DataGrid jupyterApp={this.jupyterApp} />
    );
  }
}

export class RegisterAlgorithmsWidget extends ReactWidget {
  jupyterApp: JupyterFrontEnd;
  constructor(jupyterApp: JupyterFrontEnd) {
    super();
    this.jupyterApp = jupyterApp;
  }

  render(): JSX.Element {
    return (
      // <ViewJobsContainer jupyterApp={this.jupyterApp} />
      <div style={{ overflow: 'scroll' }}>
        <RegistrationForm jupyterApp={this.jupyterApp} />
      </div>
    );
  }
}
