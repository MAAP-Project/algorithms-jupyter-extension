import React from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { IDefaultFileBrowser } from '@jupyterlab/filebrowser';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { DataGrid } from './components/DataGrid/DataGrid';
import { RegistrationForm } from './components/RegistrationForm/RegistrationForm';
import { BuildsDeploymentsGrid } from './components/BuildsDeploymentsGrid/BuildsDeploymentsGrid';

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
  fileBrowser: IDefaultFileBrowser;
  docManager: IDocumentManager;
  constructor(
    jupyterApp: JupyterFrontEnd,
    fileBrowser: IDefaultFileBrowser,
    docManager: IDocumentManager
  ) {
    super();
    this.jupyterApp = jupyterApp;
    this.fileBrowser = fileBrowser;
    this.docManager = docManager;
  }

  render(): JSX.Element {
    return (
      // <ViewJobsContainer jupyterApp={this.jupyterApp} />
      <div style={{ overflow: 'scroll' }}>
        <RegistrationForm
          jupyterApp={this.jupyterApp}
          fileBrowser={this.fileBrowser}
          docManager={this.docManager}
        />
      </div>
    );
  }
}

export class BuildsDeploymentsWidget extends ReactWidget {
  jupyterApp: JupyterFrontEnd;
  constructor(jupyterApp: JupyterFrontEnd) {
    super();
    this.jupyterApp = jupyterApp;
  }

  render(): JSX.Element {
    return <BuildsDeploymentsGrid jupyterApp={this.jupyterApp} />;
  }
}
