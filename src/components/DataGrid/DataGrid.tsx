import React, { useEffect, useState } from 'react';
import { useMemo } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef
} from 'material-react-table';
import { Box, Typography } from '@mui/material';
import { openJobsSubmit, openRegisterAlgorithm } from '../../utils/utils';
import { Process, ProcessDetailed } from '../../types/process';
import { ExpandedState } from '@tanstack/react-table';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { MaapApi } from '../../utils/api';

type DataGridProps = {
  jupyterApp: JupyterFrontEnd;
  api: MaapApi;
};

export const DataGrid = ({ jupyterApp, api }: DataGridProps) => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());
  const [rowDetails, setRowDetails] = useState<
    Record<string, ProcessDetailed | null>
  >({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProcesses();
  }, [api]);

  const handleRowExpand = async (
    updater: ExpandedState | ((old: ExpandedState) => ExpandedState)
  ) => {
    const oldExpanded = Object.fromEntries(
      [...expandedRowIds].map(id => [id, true])
    );
    const newExpanded =
      typeof updater === 'function' ? updater(oldExpanded) : updater;

    const newExpandedIds = new Set(Object.keys(newExpanded));

    // Find the row that was just expanded
    const added = [...newExpandedIds].find(id => !expandedRowIds.has(id));
    const removed = [...expandedRowIds].find(id => !newExpandedIds.has(id));

    // Fetch details if row was added
    if (added) {
      const data = table.getRowModel().rowsById[added];
      const links = data?.original?.links;
      const selfLink = links?.find(link => link.rel === 'self');
      const processResource = selfLink?.href;

      if (processResource) {
        try {
          const processId =
            processResource.split('/').filter(Boolean).pop() || '';
          const detail = await api.getProcess(processId);
          setRowDetails(prev => ({ ...prev, [added]: detail }));
        } catch (error) {
          console.error(`Failed to fetch details for ${added}:`, error);
          setRowDetails(prev => ({ ...prev, [added]: null }));
        }
      }
    }

    // Update Set based on added/removed rows
    const updatedSet = new Set(expandedRowIds);
    if (added) {
      updatedSet.add(added);
    }
    if (removed) {
      updatedSet.delete(removed);
    }
    setExpandedRowIds(updatedSet);
  };

  const fetchProcesses = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProcesses();
      setProcesses(data);
    } catch (err) {
      console.error('Failed to load processes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = useMemo<MRT_ColumnDef<Process>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Algorithm Name',
        size: 50
      },
      {
        accessorKey: 'version',
        header: 'Version',
        size: 50
      },
      {
        accessorKey: 'description',
        header: 'Description',
        Cell: ({ row }) => (
          <Tooltip
            title={row.original.description}
            placement="top"
            arrow
            enterDelay={1000}
          >
            <Box
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '500px',
                cursor: 'pointer'
              }}
            >
              {row.original.description}
            </Box>
          </Tooltip>
        )
      },
      {
        accessorKey: 'author',
        header: 'Author'
      },
      {
        accessorKey: 'deployedBy',
        header: 'Deployed By'
      },
      {
        accessorKey: 'lastModifiedTime',
        header: 'Last Modified',
        Cell: ({ row }) => {
          const rawDate = row.original.lastModifiedTime;
          const formatted = rawDate
            ? new Date(rawDate).toISOString().slice(0, 19)
            : '-';
          return formatted;
        }
      }
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: processes,
    enableExpandAll: false,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    initialState: {
      density: 'compact',
      sorting: [
        {
          id: 'lastModifiedTime',
          desc: true
        }
      ]
    },
    state: {
      expanded: Object.fromEntries([...expandedRowIds].map(id => [id, true]))
    },
    displayColumnDefOptions: {
      'mrt-row-expand': {
        size: 100,
        header: ''
      }
    },
    muiTableHeadRowProps: () => ({
      sx: {
        boxShadow: 'none',
        border: theme => `1px solid ${theme.palette.divider}`
      }
    }),
    muiDetailPanelProps: () => ({
      sx: { padding: 0 }
    }),
    muiTableContainerProps: {
      sx: {
        border: theme => `1px solid ${theme.palette.divider}`
      }
    },
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        ...(row.getIsExpanded() && {
          backgroundColor: 'rgba(0, 0, 0, 0.03)',
          '& > td': {
            borderBottom: 'none',
            borderLeft: 'blue'
          }
        })
      }
    }),
    muiExpandButtonProps: ({ row }) => ({
      sx: {
        transform: row.getIsExpanded() ? 'rotate(180deg)' : 'rotate(-90deg)',
        transition: 'transform 0.2s'
      }
    }),
    onExpandedChange: row => handleRowExpand(row),
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <Typography variant="h6" sx={{ ml: 2, mr: 2 }}>
          Algorithm Search and Discovery
        </Typography>
        <Tooltip title="Refresh algorithms" placement="top" arrow>
          <IconButton
            onClick={fetchProcesses}
            disabled={isLoading}
            sx={{
              mr: 1,
              transform: isLoading ? 'rotate(360deg)' : 'rotate(0deg)',
              transition: 'transform 0.5s ease-in-out'
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        <button
          className="st-button"
          onClick={() => openRegisterAlgorithm(jupyterApp, null)}
        >
          Register New Algorithm
        </button>
      </Box>
    ),
    renderDetailPanel: ({ row }) => {
      const processDetails = rowDetails[row.id];

      if (!processDetails) {
        return (
          <Box p={2}>
            <Typography>Loading details...</Typography>
          </Box>
        );
      }
      return (
        <Box
          sx={{
            backgroundColor: 'white',
            borderBottom: theme => `1px solid ${theme.palette.divider}`,
            padding: '2rem',
            boxShadow: '0px 5px 10px lightgrey inset'
          }}
        >
          <h4>Actions</h4>
          <button
            className="st-button"
            onClick={() =>
              openJobsSubmit(jupyterApp, {
                processID: Number(processDetails.processID)
              })
            }
          >
            Configure Job
          </button>
          <table className="st-table">
            <h4>General Information</h4>
            <tbody>
              <tr>
                <td className="st-label-cell">Process ID</td>
                <td>{processDetails.processID ?? '-'}</td>
              </tr>
              <tr>
                <td className="st-label-cell">Code Repository</td>
                <td>
                  <a
                    href={processDetails.githubUrl}
                    style={{ color: '#1976d2' }}
                  >
                    {processDetails.githubUrl}
                  </a>
                </td>
              </tr>
              <tr>
                <td className="st-label-cell">Git Commit Hash</td>
                <td>
                  {processDetails.gitCommitHash ? (
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      {processDetails.gitCommitHash}
                      <CopyButton hash={processDetails.gitCommitHash} />
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
              <tr>
                <td className="st-label-cell">CWL Link</td>
                <td>
                  <a href={processDetails.cwlLink} style={{ color: '#1976d2' }}>
                    {processDetails.cwlLink ?? '-'}
                  </a>
                </td>
              </tr>
              <tr>
                <td className="st-label-cell">RAM Min</td>
                <td>{processDetails.ramMin ?? '-'}</td>
              </tr>
              <tr>
                <td className="st-label-cell">Cores Min</td>
                <td>{processDetails.coresMin ?? '-'}</td>
              </tr>
              <tr>
                <td className="st-label-cell">Run Command</td>
                <td>{processDetails.baseCommand ?? '-'}</td>
              </tr>
            </tbody>
          </table>
          {processDetails.inputs ? (
            <Box>
              <h4 className="margin-top-2">Input Parameters</h4>
              <table className="st-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Label</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Default Value</th>
                  </tr>
                </thead>
                <tbody>
                  {processDetails.inputs &&
                  Object.keys(processDetails.inputs).length > 0 ? (
                    Object.entries(processDetails.inputs).map(
                      ([key, value]) => (
                        <tr key={key}>
                          <td>{value.name ?? '-'}</td>
                          <td>{value.placeholder ?? '-'}</td>
                          <td>{value.description ?? '-'}</td>
                          <td>{value.type ?? '-'}</td>
                          <td>
                            {value.default
                              ? (value.default['path'] ?? value.default)
                              : '-'}
                          </td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        style={{ textAlign: 'center', fontStyle: 'italic' }}
                      >
                        No inputs defined.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Box>
          ) : null}
        </Box>
      );
    }
  });

  return (
    <>
      <div
        className="ag-theme-stellar algorithms-table"
        style={{ height: '100%', width: '100%' }}
      >
        <MaterialReactTable table={table} />
      </div>
    </>
  );
};

const CopyButton = ({ hash }: any) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      setCopied(false);
    }
  };

  return (
    <Tooltip title={copied ? 'Copied!' : 'Copy'} placement="top" arrow>
      <IconButton size="small" onClick={handleCopy} sx={{ ml: 1 }}>
        <ContentCopyIcon
          fontSize="small"
          color={copied ? 'success' : 'inherit'}
        />
      </IconButton>
    </Tooltip>
  );
};
