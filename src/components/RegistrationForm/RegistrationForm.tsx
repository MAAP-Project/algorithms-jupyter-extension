import React, { useState } from 'react';
import {
  Button,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { registerAlgorithm } from '../../utils/api';
import { FileDialog, IDefaultFileBrowser } from '@jupyterlab/filebrowser';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { IDocumentManager } from '@jupyterlab/docmanager';

export const RegistrationForm = ({
  jupyterApp,
  fileBrowser,
  docManager
}: {
  jupyterApp: JupyterFrontEnd;
  fileBrowser: IDefaultFileBrowser;
  docManager: IDocumentManager;
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  const [token, setToken] = useState('');
  const [inputRows, setInputRows] = useState<
    Array<{
      id: number;
      name: string;
      label: string;
      description: string;
      defaultValue: string;
      type: string;
    }>
  >([]);

  const handleClose = () => {
    setShowModal(false);
  };

  const handleCloseReg = () => {
    setShowRegModal(false);
  };

  const addInputRow = () => {
    const newRow = {
      id: Date.now(),
      name: '',
      label: '',
      description: '',
      defaultValue: '',
      type: ''
    };
    setInputRows([...inputRows, newRow]);
  };

  const removeInputRow = id => {
    setInputRows(inputRows.filter(row => row.id !== id));
  };

  const updateInputRow = (id, field, value) => {
    setInputRows(
      inputRows.map(row => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const openFileDialog = async () => {
    console.log('Opening file dialog');
    const result = await jupyterApp.commands.execute('file-dialog');
    console.log('Result:', result);

    populateFormWithConfig(result);
  };

  const populateFormWithConfig = config => {
    // Helper function to set input values
    const setInputValue = (name: string, value: any) => {
      const inputElement = document.querySelector(
        `input[name="${name}"]`
      ) as HTMLInputElement;
      if (inputElement) {
        inputElement.value = value;
        return true;
      }
      return false;
    };

    // Set top-level properties
    Object.keys(config).forEach(key => {
      if (typeof config[key] !== 'object' || config[key] === null) {
        setInputValue(key, config[key]);
      }
    });

    // Set nested object properties
    if (config.resource_requirements) {
      Object.keys(config.resource_requirements).forEach(key => {
        setInputValue(key, config.resource_requirements[key]);
      });
    }

    if (config.metadata) {
      Object.keys(config.metadata).forEach(key => {
        setInputValue(key, config.metadata[key]);
      });
    }

    // Handle inputs array
    if (config.inputs && Array.isArray(config.inputs)) {
      setInputRows(
        config.inputs.map((input, index) => ({
          id: Date.now() + index,
          name: input.name || '',
          label: input.label || '',
          description: input.doc || '',
          defaultValue: input.default_value || input.defaultValue || '',
          type: input.type || ''
        }))
      );
    }
  };

  const handleTokenSubmit = e => {
    e.preventDefault();
    console.log('Entered token: ', token);
    localStorage.setItem('MAAP_PGT_TOKEN', token);
    handleClose();
  };

  const handleSubmit = event => {
    event.preventDefault();
    const formData = new FormData(event.target);
    // Collect form data into an object
    const algorithmData: any = {};
    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
      algorithmData[key] = value;
    });

    // Add input rows data
    if (inputRows.length > 0) {
      algorithmData.inputs = inputRows.map(row => ({
        name: row.name,
        description: row.description,
        type: row.type,
        default_value: row.defaultValue
      }));
    }

    // Convert to YAML format
    const yamlContent = convertToYAML(algorithmData);

    // Create and download YAML file
    createAndDownloadYAML(
      yamlContent,
      algorithmData.algorithm_name || 'algorithm'
    );
    // TODO: local storage/session storage?
    // eslint-disable-next-line no-prototype-builtins
    if (!localStorage.hasOwnProperty('MAAP_PGT_TOKEN')) {
      // Modal requesting token
      console.log('no token detected');
      setShowModal(true);
      localStorage.setItem('MAAP_PGT_TOKEN', token);
    }

    registerAlgorithm(formData);
    setShowRegModal(true);
  };

  const convertToYAML = data => {
    const sections: string[] = [];
    // General information
    const general: string[] = [];
    if (data.algorithm_name) {
      general.push(`name: ${data.algorithm_name}`);
    }
    if (data.version) {
      general.push(`version: ${data.version}`);
    }
    if (data.algorithm_description) {
      general.push(`description: ${data.algorithm_description}`);
    }
    if (data.code_repository) {
      general.push(`code_repository: ${data.code_repository}`);
    }
    if (data.base_command) {
      general.push(`base_command: ${data.base_command}`);
    }
    if (general.length > 0) {
      sections.push(general.join('\n'));
    }

    // Resource requirements
    const resources: string[] = [];
    if (data.ram_min || data.ram_max || data.cores_min || data.cores_max) {
      resources.push('resource_requirements:');
      if (data.ram_min) {
        resources.push(`  ram_min: ${data.ram_min}`);
      }
      if (data.ram_max) {
        resources.push(`  ram_max: ${data.ram_max}`);
      }
      if (data.cores_min) {
        resources.push(`  cores_min: ${data.cores_min}`);
      }
      if (data.cores_max) {
        resources.push(`  cores_max: ${data.cores_max}`);
      }
      sections.push(resources.join('\n'));
    }

    // Metadata
    const metadata: string[] = [];
    if (
      data.author ||
      data.contributor ||
      data.license ||
      data.release_notes ||
      data.citation ||
      data.keywords
    ) {
      metadata.push('metadata:');
      if (data.author) {
        metadata.push(`  author: ${data.author}`);
      }
      if (data.contributor) {
        metadata.push(`  contributor: ${data.contributor}`);
      }
      if (data.license) {
        metadata.push(`  license: ${data.license}`);
      }
      if (data.release_notes) {
        metadata.push(`  release_notes: ${data.release_notes}`);
      }
      if (data.citation) {
        metadata.push(`  citation: ${data.citation}`);
      }
      if (data.keywords) {
        metadata.push(`  keywords: ${data.keywords}`);
      }
      sections.push(metadata.join('\n'));
    }
    // Inputs
    if (data.inputs && data.inputs.length > 0) {
      const inputs = ['inputs:'];
      data.inputs.forEach(input => {
        inputs.push(`  - name: ${input.name || ''}`);
        inputs.push(`    label: ${input.label || ''}`);
        inputs.push(`    description: ${input.doc || ''}`);
        inputs.push(`    type: ${input.type || ''}`);
        inputs.push(`    default_value: ${input.default_value || ''}`);
      });
      sections.push(inputs.join('\n'));
    }
    return sections.join('\n\n');
  };

  const createAndDownloadYAML = async (yamlContent, algorithmName) => {
    try {
      // Get the file browser service from JupyterLab
      const contents = jupyterApp.serviceManager.contents;
      // Create filename with timestamp to avoid conflicts
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${algorithmName || 'algorithm'}_config_${timestamp}.yml`;
      // Save the YAML file to the workspace
      await contents.save(filename, {
        type: 'file',
        format: 'text',
        content: yamlContent
      });
      console.log('YAML file created and saved to workspace:', filename);
      console.log('YAML content:', yamlContent);
      // Show success message to user
      alert(`YAML configuration file saved to workspace: ${filename}`);
    } catch (error) {
      console.error('Error saving YAML file to workspace:', error);
      alert('Error saving YAML file to workspace. Please try again.');
    }
  };

  return (
    <div style={{ overflow: 'scroll' }}>
      <Dialog open={showRegModal} onClose={handleClose}>
        <DialogTitle
          sx={{ backgroundColor: 'green', color: 'white' }}
        ></DialogTitle>
        <DialogContent sx={{ paddingBottom: 0 }}>
          <DialogContentText>
            Algorithm submitted for registration.
          </DialogContentText>
          <DialogActions>
            <Button type="submit" onClick={handleCloseReg}>
              Close
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
      <Dialog open={showModal} onClose={handleClose}>
        <DialogTitle
          sx={{ backgroundColor: 'orange', color: 'white' }}
        ></DialogTitle>
        <DialogContent sx={{ paddingBottom: 0 }}>
          <DialogContentText>
            Enter your MAAP-PGT token to perform this action. You may retrieve
            it from your{' '}
            <a
              href="https://dit.maap-project.org/profile/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#1976d2', textDecoration: 'underline' }}
            >
              MAAP profile page
            </a>{' '}
            .
          </DialogContentText>
          <input
            autoFocus
            required
            id="token"
            className="st-input"
            name="token"
            placeholder="MAAP PGT Token"
            type="text"
            onChange={val => setToken(val.target.value)}
          />
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" onClick={handleTokenSubmit}>
              Ok
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Algorithm Registration Form
        </Typography>
        <button className="st-button" onClick={openFileDialog}>
          Load Algorithm Configuration
        </button>
        <p className="st-typography-body-small">
          Register your algorithm to the MAAP to run algorithm jobs. See the{' '}
          <a
            href="https://docs.maap-project.org/en/latest/getting_started/running_at_scale.html#Register-an-Algorithm"
            style={{ color: '#1976d2', textDecoration: 'underline' }}
          >
            MAAP documentation
          </a>{' '}
          for more information.
        </p>
        <form onSubmit={handleSubmit}>
          <h3>General Information</h3>
          <table className="st-table btm-margin-3">
            <tbody>
              <tr>
                <td>
                  Algorithm Name
                  <Tooltip title="The name of the algorithm.">
                    <IconButton
                      size="small"
                      style={{ marginLeft: '8px', padding: '1px' }}
                    >
                      <InfoIcon style={{ fontSize: '14px' }} />
                    </IconButton>
                  </Tooltip>
                </td>
                <td>
                  <input
                    type="text"
                    name="algorithm_name"
                    placeholder="Enter algorithm name"
                    className="st-input"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  Version
                  <Tooltip title="The version of the algorithm (e.g., develop, 1.0.0)">
                    <IconButton
                      size="small"
                      style={{ marginLeft: '8px', padding: '1px' }}
                    >
                      <InfoIcon style={{ fontSize: '14px' }} />
                    </IconButton>
                  </Tooltip>
                </td>
                <td>
                  <input
                    type="text"
                    name="algorithm_version"
                    placeholder="Enter algorithm version"
                    className="st-input"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  Algorithm Description
                  <Tooltip title="Description of the algorithm.">
                    <IconButton
                      size="small"
                      style={{ marginLeft: '8px', padding: '1px' }}
                    >
                      <InfoIcon style={{ fontSize: '14px' }} />
                    </IconButton>
                  </Tooltip>
                </td>
                <td>
                  <input
                    type="text"
                    name="algorithm_description"
                    placeholder="Enter algorithm description"
                    className="st-input"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  Repository URL
                  <Tooltip title="The URL to the algorithm source code repository.">
                    <IconButton
                      size="small"
                      style={{ marginLeft: '8px', padding: '1px' }}
                    >
                      <InfoIcon style={{ fontSize: '14px' }} />
                    </IconButton>
                  </Tooltip>
                </td>
                <td>
                  <input
                    type="text"
                    name="code_repository"
                    placeholder="Enter code repository URL"
                    className="st-input"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  Base Command
                  <Tooltip title="The main command to execute your algorithm (e.g., /app/sardem-sarsen/sardem-sarsem.sh).">
                    <IconButton
                      size="small"
                      style={{ marginLeft: '8px', padding: '1px' }}
                    >
                      <InfoIcon style={{ fontSize: '14px' }} />
                    </IconButton>
                  </Tooltip>
                </td>
                <td>
                  <input
                    type="text"
                    name="run_command"
                    placeholder="Enter base command"
                    className="st-input"
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <h3>Resource Requirements</h3>
          <table className="st-table btm-margin-3">
            <tbody>
              <tr>
                <td>
                  Minimum RAM
                  <Tooltip title="The minimum amount of RAM (in GB) required to run your algorithm (e.g., 4).">
                    <IconButton
                      size="small"
                      style={{ marginLeft: '8px', padding: '1px' }}
                    >
                      <InfoIcon style={{ fontSize: '14px' }} />
                    </IconButton>
                  </Tooltip>
                </td>
                <td>
                  <input
                    type="text"
                    name="ram_min"
                    placeholder="Enter minimum RAM"
                    className="st-input"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  Minimum Number of Cores
                  <Tooltip title="The minimum number of CPU cores required to run your algorithm (e.g., 1).">
                    <IconButton
                      size="small"
                      style={{ marginLeft: '8px', padding: '1px' }}
                    >
                      <InfoIcon style={{ fontSize: '14px' }} />
                    </IconButton>
                  </Tooltip>
                </td>
                <td>
                  <input
                    type="text"
                    name="cores_min"
                    placeholder="Enter minimum number of cores"
                    className="st-input"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  Container URL
                  <Tooltip title="The URL to the algorithm's container docker image.">
                    <IconButton
                      size="small"
                      style={{ marginLeft: '8px', padding: '1px' }}
                    >
                      <InfoIcon style={{ fontSize: '14px' }} />
                    </IconButton>
                  </Tooltip>
                </td>
                <td>
                  <input
                    type="text"
                    name="container_url"
                    placeholder="Enter container URL"
                    className="st-input"
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <h3>Metadata</h3>
          <table className="st-table btm-margin-3">
            <tbody>
              <tr>
                <td>
                  Author
                  <Tooltip title="The primary author of the algorithm.">
                    <IconButton
                      size="small"
                      style={{ marginLeft: '8px', padding: '1px' }}
                    >
                      <InfoIcon style={{ fontSize: '14px' }} />
                    </IconButton>
                  </Tooltip>
                </td>
                <td>
                  <input
                    type="text"
                    name="author"
                    placeholder="Enter author name"
                    className="st-input"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  Contributor
                  <Tooltip title="Additional contributors to the algorithm development">
                    <IconButton
                      size="small"
                      style={{ marginLeft: '8px', padding: '1px' }}
                    >
                      <InfoIcon style={{ fontSize: '14px' }} />
                    </IconButton>
                  </Tooltip>
                </td>
                <td>
                  <input
                    type="text"
                    name="contributor"
                    placeholder="Enter contributor name"
                    className="st-input"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  License
                  <Tooltip title="The license under which your algorithm is distributed.">
                    <IconButton
                      size="small"
                      style={{ marginLeft: '8px', padding: '1px' }}
                    >
                      <InfoIcon style={{ fontSize: '14px' }} />
                    </IconButton>
                  </Tooltip>
                </td>
                <td>
                  <input
                    type="text"
                    name="license"
                    placeholder="Enter license information"
                    className="st-input"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  Release Notes
                  <Tooltip title="The URL to the release notes of the algorithm.">
                    <IconButton
                      size="small"
                      style={{ marginLeft: '8px', padding: '1px' }}
                    >
                      <InfoIcon style={{ fontSize: '14px' }} />
                    </IconButton>
                  </Tooltip>
                </td>
                <td>
                  <input
                    type="text"
                    name="release_notes"
                    placeholder="Enter release notes"
                    className="st-input"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  Citation
                  <Tooltip title="How to cite this algorithm in publications">
                    <IconButton
                      size="small"
                      style={{ marginLeft: '8px', padding: '1px' }}
                    >
                      <InfoIcon style={{ fontSize: '14px' }} />
                    </IconButton>
                  </Tooltip>
                </td>
                <td>
                  <input
                    type="text"
                    name="citation"
                    placeholder="Enter citation information"
                    className="st-input"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  Keywords
                  <Tooltip title="Algorithm keywords.">
                    <IconButton
                      size="small"
                      style={{ marginLeft: '8px', padding: '1px' }}
                    >
                      <InfoIcon style={{ fontSize: '14px' }} />
                    </IconButton>
                  </Tooltip>
                </td>
                <td>
                  <input
                    type="text"
                    name="keywords"
                    placeholder="Enter keywords"
                    className="st-input"
                  />
                </td>
              </tr>
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
                <th>Name</th>
                <th>Label</th>
                <th>Description</th>
                <th>Type</th>
                <th>Default Value</th>
              </tr>
            </thead>
            <tbody>
              {inputRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
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
                        value={row.description}
                        onChange={e =>
                          updateInputRow(row.id, 'description', e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name={`input_${row.id}_type`}
                        placeholder="Enter input type"
                        className="st-input compact"
                        value={row.type}
                        onChange={e =>
                          updateInputRow(row.id, 'type', e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name={`input_${row.id}_default`}
                        placeholder="Enter default value"
                        className="st-input compact"
                        value={row.defaultValue}
                        onChange={e =>
                          updateInputRow(row.id, 'defaultValue', e.target.value)
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
          <Box mt={4}>
            <button type="submit" className="st-button" disabled={true}>
              Register Algorithm
            </button>
          </Box>
        </form>
      </Box>
    </div>
  );
};
