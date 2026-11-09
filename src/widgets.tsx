import React from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { IDefaultFileBrowser } from '@jupyterlab/filebrowser';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { DataGrid } from './components/DataGrid/DataGrid';
import { RegistrationForm } from './components/RegistrationForm/RegistrationForm';
import { BuildsDeploymentsGrid } from './components/BuildsDeploymentsGrid/BuildsDeploymentsGrid';

import { MaapProvider } from './MaapContext';
import { useMaapApi } from './hooks/useMaapApi';

const AlgorithmsPanel: React.FC<{ jupyterApp: JupyterFrontEnd }> = ({
  jupyterApp
}) => {
  const api = useMaapApi();
  return <DataGrid jupyterApp={jupyterApp} api={api} />;
};

const RegisterAlgorithmsPanel: React.FC<{
  jupyterApp: JupyterFrontEnd;
  fileBrowser: IDefaultFileBrowser;
  docManager: IDocumentManager;
}> = ({ jupyterApp, fileBrowser, docManager }) => {
  const api = useMaapApi();
  return (
    <RegistrationForm
      jupyterApp={jupyterApp}
      fileBrowser={fileBrowser}
      docManager={docManager}
      api={api}
    />
  );
};

const BuildsDeploymentsPanel: React.FC<{ jupyterApp: JupyterFrontEnd }> = ({
  jupyterApp
}) => {
  const api = useMaapApi();
  return <BuildsDeploymentsGrid jupyterApp={jupyterApp} api={api} />;
};

// -------------------------
// JupyterLab Widgets
// -------------------------

// Lumino sets `overflow: hidden` on every widget node and sizes main-area
// content to a fixed height, so the widget node itself must be the scroll
// container. Scoped to our widgets only (see style/base.css).
const SCROLLABLE_CLASS = 'maap-ScrollableWidget';

export class AlgorithmsWidget extends ReactWidget {
  jupyterApp: JupyterFrontEnd;
  settings: ISettingRegistry.ISettings;

  constructor(
    jupyterApp: JupyterFrontEnd,
    settings: ISettingRegistry.ISettings
  ) {
    super();
    this.addClass(SCROLLABLE_CLASS);
    this.jupyterApp = jupyterApp;
    this.settings = settings;
  }

  render(): JSX.Element {
    return (
      <MaapProvider settings={this.settings}>
        <AlgorithmsPanel jupyterApp={this.jupyterApp} />
      </MaapProvider>
    );
  }
}

export class RegisterAlgorithmsWidget extends ReactWidget {
  jupyterApp: JupyterFrontEnd;
  fileBrowser: IDefaultFileBrowser;
  docManager: IDocumentManager;
  settings: ISettingRegistry.ISettings;

  constructor(
    jupyterApp: JupyterFrontEnd,
    fileBrowser: IDefaultFileBrowser,
    docManager: IDocumentManager,
    settings: ISettingRegistry.ISettings
  ) {
    super();
    this.addClass(SCROLLABLE_CLASS);
    this.jupyterApp = jupyterApp;
    this.fileBrowser = fileBrowser;
    this.docManager = docManager;
    this.settings = settings;
  }

  render(): JSX.Element {
    return (
      <MaapProvider settings={this.settings}>
        <RegisterAlgorithmsPanel
          jupyterApp={this.jupyterApp}
          fileBrowser={this.fileBrowser}
          docManager={this.docManager}
        />
      </MaapProvider>
    );
  }
}

export class BuildsDeploymentsWidget extends ReactWidget {
  jupyterApp: JupyterFrontEnd;
  settings: ISettingRegistry.ISettings;

  constructor(
    jupyterApp: JupyterFrontEnd,
    settings: ISettingRegistry.ISettings
  ) {
    super();
    this.addClass(SCROLLABLE_CLASS);
    this.jupyterApp = jupyterApp;
    this.settings = settings;
  }

  render(): JSX.Element {
    return (
      <MaapProvider settings={this.settings}>
        <BuildsDeploymentsPanel jupyterApp={this.jupyterApp} />
      </MaapProvider>
    );
  }
}
