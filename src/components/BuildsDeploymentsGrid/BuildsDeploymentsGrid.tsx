import React, { useEffect, useState } from 'react';
import { useMemo } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef
} from 'material-react-table';
import {
  Box,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField
} from '@mui/material';
import { openRegisterAlgorithm } from '../../utils/utils';
import { getBuilds, getDeployments, getBuildStatus, getDeploymentStatus } from '../../utils/api';
import { hasMaapToken, setMaapToken } from '../../utils/auth';
import { MAAP_PROFILE_URL } from '../../constants';
import { Build, Deployment, BuildDeploymentItem } from '../../types/build';
import { ExpandedState } from '@tanstack/react-table';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LaunchIcon from '@mui/icons-material/Launch';
import RefreshIcon from '@mui/icons-material/Refresh';

export const BuildsDeploymentsGrid = ({ jupyterApp }) => {
  const [items, setItems] = useState<BuildDeploymentItem[]>([]);
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());
  const [rowDetails, setRowDetails] = useState<
    Record<string, BuildDeploymentItem | null>
  >({});
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [token, setToken] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCloseTokenModal = () => {
    setShowTokenModal(false);
  };

  const handleTokenModalSubmit = async () => {
    setMaapToken(token);
    setShowTokenModal(false);
    // Retry fetching data after token is set
    fetchData();
  };

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

    // For builds/deployments, we already have the details in the item
    if (added) {
      const data = table.getRowModel().rowsById[added];
      if (data?.original) {
        setRowDetails(prev => ({ ...prev, [added]: data.original }));
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

  const transformBuildsToItems = (builds: Build[]): BuildDeploymentItem[] => {
    return builds.map(build => ({
      id: build.build_id,
      type: 'build' as const,
      name:
        build.repository_url?.split('/').pop()?.replace('.git', '') ||
        build.build_id,
      status: build.status,
      created: build.created,
      updated: build.updated,
      repository_url: build.repository_url,
      version: build.branch_ref,
      links: build.links,
      pipelineLink: build.pipelineLink,
      deploymentLink: build.deploymentLink,
      deploymentError: build.deploymentError
    }));
  };

  const transformDeploymentsToItems = (
    deployments: Deployment[]
  ): BuildDeploymentItem[] => {
    return deployments.map(deployment => ({
      id: deployment.job_id.toString(),
      type: 'deployment' as const,
      name: deployment.id || deployment.process_id || 'Unknown Process',
      status: deployment.status,
      created: deployment.created || '',
      repository_url: deployment.github_url,
      version: deployment.version,
      links: [],
      description: deployment.description,
      author: deployment.author
    }));
  };

  const isNonFinalState = (status: string) => {
    const finalStates = ['successful', 'failed', 'canceled', 'cancelled', 'dismissed'];
    return !finalStates.includes(status.toLowerCase());
  };

  const refreshNonFinalStates = async () => {
    if (!hasMaapToken() || isRefreshing) {
      return;
    }

    setIsRefreshing(true);
    try {
      console.log('Refreshing builds and deployments...');
      
      // First, fetch fresh data to get any new builds/deployments
      const [buildsResponse, deploymentsResponse] = await Promise.allSettled([
        getBuilds(),
        getDeployments().catch(() => ({ deploymentJobs: [] }))
      ]);

      const builds = buildsResponse.status === 'fulfilled' ? buildsResponse.value.builds : [];
      const deployments = deploymentsResponse.status === 'fulfilled' ? deploymentsResponse.value.deploymentJobs : [];

      const freshBuildItems = transformBuildsToItems(builds);
      const freshDeploymentItems = transformDeploymentsToItems(deployments);
      const freshAllItems = [...freshBuildItems, ...freshDeploymentItems];

      // Create a map of existing items for comparison
      const existingItemsMap = new Map(items.map(item => [item.id, item]));
      
      // Identify new items and items that need status updates
      const newItems = freshAllItems.filter(item => !existingItemsMap.has(item.id));
      const itemsToRefresh = freshAllItems.filter(item => 
        existingItemsMap.has(item.id) && isNonFinalState(item.status)
      );

      console.log(`Found ${newItems.length} new items and ${itemsToRefresh.length} items to refresh`);

      if (newItems.length > 0) {
        console.log('New items found:', newItems.map(item => `${item.type} ${item.id}`));
      }

      // For items that need status refresh, get individual status
      const refreshPromises = itemsToRefresh.map(async (item) => {
        try {
          let updatedData;
          if (item.type === 'build') {
            updatedData = await getBuildStatus(item.id);
          } else {
            updatedData = await getDeploymentStatus(item.id);
          }
          return { 
            id: item.id, 
            status: updatedData.status,
            updated: updatedData.updated,
            pipelineLink: updatedData.pipelineLink,
            deploymentLink: updatedData.deploymentLink,
            deploymentError: updatedData.deploymentError
          };
        } catch (error) {
          console.error(`Failed to refresh status for ${item.type} ${item.id}:`, error);
          return { id: item.id, status: item.status }; // Keep current status on error
        }
      });

      const refreshedData = await Promise.all(refreshPromises);
      const refreshMap = new Map(refreshedData.map(item => [item.id, item]));

      // Combine fresh data with updated statuses
      const updatedItems = freshAllItems.map(item => {
        const refreshedItem = refreshMap.get(item.id);
        if (refreshedItem && refreshedItem.status !== item.status) {
          console.log(`Updated ${item.type} ${item.id} status: ${item.status} -> ${refreshedItem.status}`);
          return { 
            ...item, 
            status: refreshedItem.status,
            updated: refreshedItem.updated || item.updated,
            pipelineLink: refreshedItem.pipelineLink || item.pipelineLink,
            deploymentLink: refreshedItem.deploymentLink || item.deploymentLink,
            deploymentError: refreshedItem.deploymentError || item.deploymentError
          };
        }
        return item;
      });

      // Sort by created date (most recent first)
      const sortedItems = updatedItems.sort((a, b) => {
        const dateA = new Date(a.created).getTime();
        const dateB = new Date(b.created).getTime();
        return dateB - dateA;
      });

      setItems(sortedItems);

      if (newItems.length > 0 || refreshedData.some(item => item.status !== items.find(i => i.id === item.id)?.status)) {
        console.log('Refresh completed with updates');
      } else {
        console.log('Refresh completed - no changes detected');
      }
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchData = async () => {
    if (!hasMaapToken()) {
      console.warn('No MAAP PGT token detected.');
      setShowTokenModal(true);
      return;
    }

    try {
      console.log('Fetching builds and deployments...');
      
      // Fetch builds and deployments separately to see individual errors
      const buildsResponse = await getBuilds();
      console.log('Builds response:', buildsResponse);
      
      let deploymentsResponse;
      try {
        deploymentsResponse = await getDeployments();
        console.log('Deployments response:', deploymentsResponse);
      } catch (deploymentError) {
        console.error('Deployments fetch failed:', deploymentError);
        // Create empty response if deployments fail
        deploymentsResponse = { deploymentJobs: [] };
      }

      const buildItems = transformBuildsToItems(buildsResponse.builds);
      console.log('Transformed build items:', buildItems);
      
      const deploymentItems = transformDeploymentsToItems(
        deploymentsResponse.deploymentJobs
      );
      console.log('Transformed deployment items:', deploymentItems);

      // Combine and sort by created date (most recent first)
      const allItems = [...buildItems, ...deploymentItems].sort((a, b) => {
        const dateA = new Date(a.created).getTime();
        const dateB = new Date(b.created).getTime();
        return dateB - dateA;
      });

      console.log('Final items to display:', allItems);
      setItems(allItems);
    } catch (err) {
      console.error('Failed to load builds and deployments:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusColor = (status: string, type: string) => {
    switch (status.toLowerCase()) {
      case 'successful':
      case 'success':
      case 'deployed':
        return 'success';
      case 'failed':
      case 'error':
        return 'error';
      case 'running':
      case 'accepted':
        return 'primary';
      case 'pending':
        return 'warning'; // This will be mustard/orange color
      case 'canceled':
      case 'cancelled':
        return 'warning';
      default:
        return 'default';
    }
  };

  const columns = useMemo<MRT_ColumnDef<BuildDeploymentItem>[]>(
    () => [
      {
        accessorKey: 'type',
        header: 'Type',
        size: 80,
        Cell: ({ row }) => (
          <Chip
            label={row.original.type === 'build' ? 'Build' : 'Deploy'}
            size="small"
            variant="outlined"
            color={row.original.type === 'build' ? 'primary' : 'secondary'}
          />
        )
      },
      {
        accessorKey: 'name',
        header: 'Name',
        size: 200
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 100,
        Cell: ({ row }) => (
          <Chip
            label={row.original.status}
            size="small"
            color={getStatusColor(row.original.status, row.original.type)}
          />
        )
      },
      {
        accessorKey: 'version',
        header: 'Version',
        size: 100
      },
      {
        accessorKey: 'created',
        header: 'Created',
        size: 150,
        Cell: ({ row }) => {
          const rawDate = row.original.created;
          const formatted = rawDate
            ? new Date(rawDate).toISOString().slice(0, 19).replace('T', ' ')
            : '-';
          return formatted;
        }
      },
      {
        accessorKey: 'updated',
        header: 'Updated',
        size: 150,
        Cell: ({ row }) => {
          const rawDate = row.original.updated;
          const formatted = rawDate
            ? new Date(rawDate).toISOString().slice(0, 19).replace('T', ' ')
            : '-';
          return formatted;
        }
      },
      {
        accessorKey: 'actions',
        header: 'Actions',
        muiTableHeadCellProps: {
          align: 'center'
        },
        enableSorting: false,
        muiTableBodyCellProps: { align: 'center' },
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            {row.original.pipelineLink && (
              <Tooltip title="View Pipeline" placement="top" arrow>
                <IconButton
                  size="small"
                  onClick={() =>
                    window.open(row.original.pipelineLink?.href, '_blank')
                  }
                >
                  <LaunchIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {row.original.deploymentLink && (
              <Tooltip title="View Deployment" placement="top" arrow>
                <IconButton
                  size="small"
                  onClick={() =>
                    window.open(row.original.deploymentLink?.href, '_blank')
                  }
                >
                  <LaunchIcon fontSize="small" color="secondary" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )
      }
    ],
    []
  );

  console.log('Rendering table with items:', items);
  
  const table = useMaterialReactTable({
    columns,
    data: items,
    enableExpandAll: false,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    initialState: {
      density: 'compact',
      sorting: [
        {
          id: 'created',
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
          My Builds & Deployments
        </Typography>
        <Tooltip title="Refresh non-final states" placement="top" arrow>
          <IconButton
            size="small"
            onClick={refreshNonFinalStates}
            disabled={isRefreshing}
            sx={{ mr: 2 }}
          >
            <RefreshIcon fontSize="small" />
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
      const item = rowDetails[row.id] || row.original;

      if (!item) {
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
          <table className="st-table">
            <h4>{item.type === 'build' ? 'Build' : 'Deployment'} Details</h4>
            <tbody>
              <tr>
                <td className="st-label-cell">ID</td>
                <td>{item.id}</td>
              </tr>
              <tr>
                <td className="st-label-cell">Status</td>
                <td>
                  <Chip
                    label={item.status}
                    size="small"
                    color={getStatusColor(item.status, item.type)}
                  />
                </td>
              </tr>
              {item.repository_url && (
                <tr>
                  <td className="st-label-cell">Repository</td>
                  <td>
                    <a
                      href={item.repository_url}
                      style={{ color: '#1976d2' }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.repository_url}
                    </a>
                  </td>
                </tr>
              )}
              {item.version && (
                <tr>
                  <td className="st-label-cell">Version/Branch</td>
                  <td>{item.version}</td>
                </tr>
              )}
              {item.description && (
                <tr>
                  <td className="st-label-cell">Description</td>
                  <td>{item.description}</td>
                </tr>
              )}
              {item.author && (
                <tr>
                  <td className="st-label-cell">Author</td>
                  <td>{item.author}</td>
                </tr>
              )}
              <tr>
                <td className="st-label-cell">Created</td>
                <td>{new Date(item.created).toLocaleString()}</td>
              </tr>
              {item.updated && (
                <tr>
                  <td className="st-label-cell">Updated</td>
                  <td>{new Date(item.updated).toLocaleString()}</td>
                </tr>
              )}
              {item.deploymentError && (
                <tr>
                  <td className="st-label-cell">Deployment Error</td>
                  <td style={{ color: 'red' }}>{item.deploymentError}</td>
                </tr>
              )}
            </tbody>
          </table>

          {(item.pipelineLink || item.deploymentLink) && (
            <Box sx={{ mt: 2 }}>
              <h4>Actions</h4>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {item.pipelineLink && (
                  <button
                    className="st-button"
                    onClick={() =>
                      window.open(item.pipelineLink?.href, '_blank')
                    }
                  >
                    View Pipeline
                  </button>
                )}
                {item.deploymentLink && (
                  <button
                    className="st-button"
                    onClick={() =>
                      window.open(item.deploymentLink?.href, '_blank')
                    }
                  >
                    View Deployment
                  </button>
                )}
              </Box>
            </Box>
          )}
        </Box>
      );
    }
  });

  return (
    <>
      <Dialog open={showTokenModal} onClose={handleCloseTokenModal}>
        <DialogTitle sx={{ backgroundColor: 'orange', color: 'white' }}>
          MAAP PGT Token Required
        </DialogTitle>
        <DialogContent sx={{ paddingBottom: 0 }}>
          <DialogContentText>
            To access your builds and deployments, you need to provide your MAAP
            PGT Token. You can get this token by visiting{' '}
            <a
              href={MAAP_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#1976d2' }}
            >
              your MAAP profile
            </a>
            .
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="MAAP PGT Token"
            type="password"
            fullWidth
            variant="outlined"
            value={token}
            onChange={e => setToken(e.target.value)}
            sx={{ mt: 2 }}
          />
          <DialogActions>
            <Button onClick={handleCloseTokenModal}>Cancel</Button>
            <Button onClick={handleTokenModalSubmit}>Set Token</Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
      <div
        className="ag-theme-stellar algorithms-table"
        style={{ height: '100%', width: '100%' }}
      >
        <MaterialReactTable table={table} />
      </div>
    </>
  );
};
