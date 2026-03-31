import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { MaapSettings, useMaapContext } from '../../MaapContext';
import { IDefaultFileBrowser } from '@jupyterlab/filebrowser';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { Notification } from '@jupyterlab/apputils';
import { FORM_FIELDS, ALGORITHM_INPUT_TYPES } from '../../constants';
import { FormRow } from './FormRow';
import { AlgorithmData, AlgorithmInputRow } from '../../types/registration';
import {
  buildAlgorithmConfig,
  isValidAlgorithmConfig,
  setInputValue,
  clearForm
} from './utils';
import { createDirectory, createFile } from '../../utils/utils';
import {
  AlgorithmConfig,
  AlgorithmConfigInput
} from '../../types/algorithmConfig';
import { CustomFileDialog } from '../CustomFileDialog/CustomFileDialog';
import * as yaml from 'yaml';
import { MaapApi } from '../../utils/api';
import { TokenModal } from '../TokenModal/TokenModal';

export const RegistrationForm = ({
  jupyterApp,
  fileBrowser,
  docManager,
  api
}: {
  jupyterApp: JupyterFrontEnd;
  fileBrowser: IDefaultFileBrowser;
  docManager: IDocumentManager;
  api: MaapApi;
}) => {
  const { getLatestSettings } = useMaapContext();
  const [settings, setSettings] = useState<MaapSettings | null>(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [inputRows, setInputRows] = useState<Array<AlgorithmInputRow>>([]);
  const [useAlgorithmContainer, setUseAlgorithmContainer] = useState(false);

  useEffect(() => {
    getLatestSettings().then(setSettings);
  }, []);

  const addInputRow = () => {
    const newRow: AlgorithmInputRow = {
      id: crypto.randomUUID(),
      name: '',
      label: '',
      description: '',
      default: '',
      type: ''
    };
    setInputRows([...inputRows, newRow]);
  };

  const removeInputRow = (id: string) => {
    setInputRows(inputRows.filter(row => row.id !== id));
  };

  const updateInputRow = (id: string, field: string, value: string) => {
    setInputRows(
      inputRows.map(row => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const openFileDialog = () => {
    setShowFileDialog(true);
  };

  const handleFileSelect = (fileContent: any) => {
    populateFormWithConfig(fileContent);
  };

  const populateFormWithConfig = (config: AlgorithmConfig) => {
    clearForm(setInputRows, setUseAlgorithmContainer);
    if (!isValidAlgorithmConfig(config, false)) {
      return;
    }

    config.algorithm_container_url
      ? handleSetUseAlgorithmContainer(true)
      : handleSetUseAlgorithmContainer(false);

    Object.keys(config).forEach(key => {
      if (typeof config[key] !== 'object' || config[key] === null) {
        setInputValue(key, config[key]);
      }
    });

    // Handle inputs
    // TODO: handle outputs when that is configurable
    if (config.inputs && Array.isArray(config.inputs)) {
      setInputRows(
        config.inputs.map((input: AlgorithmConfigInput) => ({
          id: crypto.randomUUID(),
          name: input.name || '',
          label: input.label || '',
          description: input.doc || '',
          default: input.default ?? '',
          type: input.type || ''
        }))
      );
    }
  };

  const handleSetUseAlgorithmContainer = (value: boolean) => {
    setUseAlgorithmContainer(value);
    setInputValue(FORM_FIELDS.algorithmContainerURL.pythonic_name, '');
    setInputValue(FORM_FIELDS.buildCommand.pythonic_name, '');
    setInputValue(FORM_FIELDS.baseContainerURL.pythonic_name, '');
  };

  const handleClearForm = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    clearForm(setInputRows, setUseAlgorithmContainer);
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const algorithmData: AlgorithmData = {
      algorithmName: '',
      algorithmVersion: '',
      algorithmDescription: '',
      codeRepository: '',
      runCommand: '',
      ramMin: 0,
      coresMin: 0,
      buildCommand: '',
      baseContainerURL: '',
      algorithmContainerURL: '',
      author: '',
      contributor: '',
      license: '',
      releaseNotes: '',
      citation: '',
      keywords: '',
      inputs: []
    };
    formData.forEach((value, key) => {
      algorithmData[key] = value;
    });

    // Convert numeric fields back to numbers
    if (algorithmData.ramMin) {
      algorithmData.ramMin = Number(algorithmData.ramMin);
    }
    if (algorithmData.coresMin) {
      algorithmData.coresMin = Number(algorithmData.coresMin);
    }

    if (inputRows.length > 0) {
      algorithmData.inputs = inputRows.map(row => ({
        name: row.name,
        label: row.label,
        doc: row.description,
        type: row.type,
        default: row.default
      }));
    }

    const yamlContent = buildAlgorithmConfig(algorithmData);
    if (yamlContent === '') {
      return;
    }
    const path = await createDirectory('algorithm_configs/', jupyterApp);
    const filePath =
      path +
      (algorithmData.algorithmName
        ? algorithmData.algorithmName + '_algorithm_config.yml'
        : 'algorithm_config.yml');
    yamlContent && (await createFile(yamlContent, filePath, jupyterApp));

    const yamlObject = yaml.parse(yamlContent);
    const jsonContent = JSON.stringify(yamlObject, null, 2);

    console.log('Registering: ', jsonContent);
    try {
      await api.registerAlgorithm(jsonContent, jupyterApp);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const is401 = message.includes('HTTP 401');

      if (is401) {
        setShowTokenModal(true);
        return;
      }
      Notification.error(`Failed to register algorithms: ${err}`, {
        autoClose: false
      });
    }
  };

  return (
    <>
      <TokenModal
        open={showTokenModal}
        onClose={() => setShowTokenModal(false)}
        onSubmit={() => setShowTokenModal(false)}
      />
      <div style={{ overflow: 'scroll' }}>
        <CustomFileDialog
          open={showFileDialog}
          onClose={() => setShowFileDialog(false)}
          onFileSelect={handleFileSelect}
          jupyterApp={jupyterApp}
          fileBrowser={fileBrowser}
          docManager={docManager}
        />
        <Box sx={{ maxWidth: 800, p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Algorithm Registration Form
          </Typography>
          <button className="st-button" onClick={openFileDialog}>
            Load Algorithm Configuration
          </button>
          {/* <p className="st-typography-body-small">
            Register your algorithm to the MAAP to run algorithm jobs. See the{' '}
            <a
              href={MAAP_DOCS_REGISTER_ALGORITHM_URL}
              target="_blank"
              style={{ color: '#1976d2', textDecoration: 'underline' }}
            >
              MAAP documentation
            </a>{' '}
            for more information.
          </p> */}
          <form onSubmit={handleFormSubmit}>
            <h3>General Information</h3>
            <table className="st-table margin-bottom-3">
              <tbody>
                <FormRow
                  key={FORM_FIELDS.algorithmName.name}
                  formInput={FORM_FIELDS.algorithmName}
                />
                <FormRow
                  key={FORM_FIELDS.algorithmVersion.name}
                  formInput={FORM_FIELDS.algorithmVersion}
                />
                <FormRow
                  key={FORM_FIELDS.algorithmDescription.name}
                  formInput={FORM_FIELDS.algorithmDescription}
                />
                <FormRow formInput={FORM_FIELDS.codeRepository} />
                <FormRow
                  key={FORM_FIELDS.runCommand.name}
                  formInput={FORM_FIELDS.runCommand}
                />
              </tbody>
            </table>
            <h3>Build Information</h3>
            <div style={{ marginBottom: '16px' }}>
              <input
                type="checkbox"
                checked={useAlgorithmContainer}
                onChange={() =>
                  handleSetUseAlgorithmContainer(!useAlgorithmContainer)
                }
              />
              <label>Use pre-built algorithm container</label>
            </div>
            <table className="st-table margin-bottom-3">
              <tbody>
                <div
                  style={{ display: useAlgorithmContainer ? 'block' : 'none' }}
                >
                  <FormRow
                    key={FORM_FIELDS.algorithmContainerURL.name}
                    formInput={FORM_FIELDS.algorithmContainerURL}
                  />
                </div>
                <div
                  style={{ display: useAlgorithmContainer ? 'none' : 'block' }}
                >
                  <FormRow
                    key={FORM_FIELDS.baseContainerURL.name}
                    formInput={{
                      ...FORM_FIELDS.baseContainerURL,
                      default: settings?.defaultAppImage
                    }}
                  />
                  <FormRow
                    key={FORM_FIELDS.buildCommand.name}
                    formInput={FORM_FIELDS.buildCommand}
                  />
                </div>
              </tbody>
            </table>
            <h3>Resource Requirements</h3>
            <table className="st-table margin-bottom-3">
              <tbody>
                <FormRow formInput={FORM_FIELDS.ramMin} />
                <FormRow formInput={FORM_FIELDS.coresMin} />
              </tbody>
            </table>
            <h3>Metadata</h3>
            <table className="st-table margin-bottom-3">
              <tbody>
                <FormRow formInput={FORM_FIELDS.author} />
                <FormRow formInput={FORM_FIELDS.contributor} />
                <FormRow formInput={FORM_FIELDS.license} />
                <FormRow formInput={FORM_FIELDS.releaseNotes} />
                <FormRow formInput={FORM_FIELDS.citation} />
                <FormRow formInput={FORM_FIELDS.keywords} />
              </tbody>
            </table>
            <h3>Inputs</h3>
            <table className="st-table inputs-table">
              <thead>
                <tr>
                  <th className="icon-cell">
                    <IconButton
                      color="primary"
                      onClick={addInputRow}
                      size="small"
                    >
                      <AddIcon style={{ fontSize: '16px' }} />
                    </IconButton>
                  </th>
                  <th>
                    Name <span style={{ color: 'red' }}> *</span>
                  </th>
                  <th>
                    Label <span style={{ color: 'red' }}> *</span>
                  </th>
                  <th>
                    Description <span style={{ color: 'red' }}> *</span>
                  </th>
                  <th>
                    Type <span style={{ color: 'red' }}> *</span>
                  </th>
                  <th>Default Value</th>
                </tr>
              </thead>
              <tbody>
                {inputRows.length === 0 ? (
                  <tr>
                    <td
                      style={{
                        textAlign: 'center',
                        padding: '20px'
                      }}
                    >
                      <i>No inputs specified</i>
                    </td>
                  </tr>
                ) : (
                  inputRows.map(row => (
                    <tr key={row.id}>
                      <td style={{ minWidth: '50px' }}></td>
                      <td>
                        <input
                          type="text"
                          name={`input_${row.id}_name`}
                          placeholder="Enter input name"
                          className="st-input compact"
                          required={true}
                          value={row.name}
                          onChange={e =>
                            updateInputRow(row.id, 'name', e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name={`input_${row.id}_label`}
                          placeholder="Enter input label"
                          className="st-input compact"
                          required={true}
                          value={row.label}
                          onChange={e =>
                            updateInputRow(row.id, 'label', e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name={`input_${row.id}_description`}
                          placeholder="Enter input description"
                          className="st-input compact"
                          required={true}
                          value={row.description}
                          onChange={e =>
                            updateInputRow(
                              row.id,
                              'description',
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <select
                          name={`input_${row.id}_type`}
                          required={true}
                          className="st-input compact"
                          value={row.type}
                          onChange={e =>
                            updateInputRow(row.id, 'type', e.target.value)
                          }
                        >
                          <option value="">Select input type</option>
                          {ALGORITHM_INPUT_TYPES.map(type => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          name={`input_${row.id}_default`}
                          placeholder="Enter default value"
                          className="st-input compact"
                          value={row.default}
                          onChange={e =>
                            updateInputRow(row.id, 'default', e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => removeInputRow(row.id)}
                        >
                          <DeleteIcon style={{ fontSize: '16px' }} />
                        </IconButton>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <Box mt={4} sx={{ display: 'flex', gap: 2 }}>
              <button type="submit" className="st-button" disabled={false}>
                Register Algorithm
              </button>
              <button
                className="st-button secondary"
                onClick={e => handleClearForm(e)}
              >
                Clear
              </button>
            </Box>
          </form>
        </Box>
      </div>
    </>
  );
};
