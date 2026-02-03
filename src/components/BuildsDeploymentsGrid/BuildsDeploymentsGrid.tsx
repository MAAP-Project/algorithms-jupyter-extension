import React, { useEffect, useState } from 'react';
import { useMemo } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef
} from 'material-react-table';
import { Box, Typography, Chip } from '@mui/material';
import { openRegisterAlgorithm } from '../../utils/utils';
import { useMaapContext } from '../../MaapContext';
import { Build, BuildDeploymentItem } from '../../types/build';
import { ExpandedState } from '@tanstack/react-table';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LaunchIcon from '@mui/icons-material/Launch';
import RefreshIcon from '@mui/icons-material/Refresh';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { MaapApi } from '../../utils/api';
import { TokenModal } from '../TokenModal/TokenModal';
import { Notification } from '@jupyterlab/apputils';

type BuildsDeploymentsGridProps = {
  jupyterApp: JupyterFrontEnd;
  api: MaapApi;
};

export const BuildsDeploymentsGrid = ({
  jupyterApp,
  api
}: BuildsDeploymentsGridProps) => {
  const [items, setItems] = useState<BuildDeploymentItem[]>([]);
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());
  const [rowDetails, setRowDetails] = useState<
    Record<string, BuildDeploymentItem | null>
  >({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);

  useEffect(() => {
    fetchData();
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

    const added = [...newExpandedIds].find(id => !expandedRowIds.has(id));
    const removed = [...expandedRowIds].find(id => !newExpandedIds.has(id));

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

  /**
   * Utility function to extract deployment ID from API href URLs
   * Handles both "/ogc/deploymentJobs/123" and "/api/ogc/deploymentJobs/123" formats
   */
  const extractDeploymentId = (deploymentHref: string): string | null => {
    try {
      // Extract deployment ID from href like "/ogc/deploymentJobs/123" or "/api/ogc/deploymentJobs/123"
      const match = deploymentHref.match(/\/deploymentJobs\/(\w+)/);
      return match ? match[1] : null;
    } catch (error) {
      console.error(
        'Error extracting deployment ID from href:',
        deploymentHref,
        error
      );
      return null;
    }
  };

  /**
   * Determines the initial deployment status for a build item
   * Key feature: Preserves existing final deployment statuses to prevent UI flickering during refresh
   */
  const getDefaultDeploymentStatus = (
    build: Build,
    existingDeploymentStatus?: string
  ): string => {
    if (!build.deploymentLink) {
      // If build is successful but has no deployment link, it should show "Not found"
      if (build.status.toLowerCase() === 'successful') {
        return 'Not found';
      }
      return 'N/A';
    }
    // If we have an existing deployment status that's in a final state, preserve it
    // This prevents "Loading..." from showing for deployments that are already completed
    if (
      existingDeploymentStatus &&
      isDeploymentInFinalState(existingDeploymentStatus)
    ) {
      return existingDeploymentStatus;
    }
    return 'Loading...'; // Will be updated from deployment endpoint
  };

  /**
   * Fetches deployment status and pipeline data for builds that have deployment links
   * Called asynchronously after initial build data is loaded
   */
  const fetchDeploymentDataForBuilds = async (
    items: BuildDeploymentItem[]
  ): Promise<BuildDeploymentItem[]> => {
    const updatedItems = await Promise.all(
      items.map(async item => {
        if (!item.deploymentLink?.href) {
          return item;
        }

        const deploymentId = extractDeploymentId(item.deploymentLink.href);
        if (!deploymentId) {
          return item;
        }

        try {
          const deploymentData = await api.getDeploymentStatus(deploymentId);

          return {
            ...item,
            deploymentStatus: deploymentData.status,
            deploymentPipelineLink:
              deploymentData.pipeline?.processPipelineLink || undefined,
            deploymentError: deploymentData.error || null
          };
        } catch (err: any) {
          const message = err instanceof Error ? err.message : String(err);
          const is401 = message.includes('HTTP 401');
          if (is401) {
            setShowTokenModal(true);
            return item;
          }

          console.warn(
            `Failed to fetch deployment status for deployment ${deploymentId}:`,
            err
          );
          Notification.error(
            `Failed to fetch deployment status for deployment ${deploymentId}: ${err}`,
            { autoClose: false }
          );

          return {
            ...item,
            deploymentStatus: 'Error',
            deploymentError: 'Failed to fetch deployment status'
          };
        }
      })
    );

    return updatedItems;
  };

  /**
   * Transforms raw build data from API into grid display items
   * Preserves existing deployment statuses and pipeline links when available
   */
  const transformBuildsToItems = (
    builds: Build[],
    existingItems?: BuildDeploymentItem[]
  ): BuildDeploymentItem[] => {
    // Create a map of existing items for quick lookup during transformation
    const existingItemsMap = existingItems
      ? new Map(existingItems.map(item => [item.id, item]))
      : new Map();

    return builds.map(build => {
      const existingItem = existingItemsMap.get(build.build_id);
      return {
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
        deploymentLink: build.deploymentLink, // Keep as-is (deployment endpoint link)
        deploymentPipelineLink:
          existingItem?.deploymentPipelineLink || undefined, // Preserve existing pipeline link
        deploymentError: build.deploymentError,
        // Key: Pass existing deployment status to prevent "Loading..." for final states
        deploymentStatus: getDefaultDeploymentStatus(
          build,
          existingItem?.deploymentStatus
        )
      };
    });
  };

  /**
   * Determines if a build status requires periodic refresh updates
   * Used to identify which builds need status polling
   */
  const isNonFinalState = (status: string) => {
    const finalStates = [
      'successful',
      'failed',
      'canceled',
      'cancelled',
      'dismissed'
    ];
    return !finalStates.includes(status.toLowerCase());
  };

  /**
   * Checks if a deployment status represents a completed/final state
   * Final states should be preserved during refresh to prevent UI flickering
   */
  const isDeploymentInFinalState = (deploymentStatus: string) => {
    if (
      !deploymentStatus ||
      deploymentStatus === 'Loading...' ||
      deploymentStatus === 'N/A'
    ) {
      return false;
    }
    const finalDeploymentStates = [
      'deployed',
      'successful',
      'failed',
      'error',
      'canceled',
      'cancelled',
      'dismissed',
      'not found'
    ];
    return finalDeploymentStates.includes(deploymentStatus.toLowerCase());
  };

  /**
   * Refresh function triggered by the refresh button
   * Only updates builds with non-final states to avoid unnecessary API calls
   * Preserves final deployment statuses to prevent UI flickering
   */
  const refreshNonFinalStates = async () => {
    if (isRefreshing) {
      return;
    }

    setIsRefreshing(true);
    try {
      // First, fetch fresh data to get any new builds
      const buildsResponse = await api.getBuilds();
      const builds = buildsResponse.builds;

      // Transform builds while preserving existing deployment statuses
      const freshBuildItems = transformBuildsToItems(builds, items);
      const freshAllItems = freshBuildItems;

      // Create a map of existing items for comparison
      const existingItemsMap = new Map(items.map(item => [item.id, item]));

      // Identify new items and items that need status updates
      // Refresh items that are in non-final states OR successful builds with non-final deployment status
      const newItems = freshAllItems.filter(
        item => !existingItemsMap.has(item.id)
      );
      const itemsToRefresh = freshAllItems.filter(
        item =>
          existingItemsMap.has(item.id) &&
          (isNonFinalState(item.status) ||
            (item.status.toLowerCase() === 'successful' &&
              item.deploymentStatus &&
              !isDeploymentInFinalState(item.deploymentStatus)))
      );

      // For items that need status refresh, fetch updated build and deployment data
      const refreshPromises = itemsToRefresh.map(async item => {
        try {
          // Always get build status first (since we only have builds now)
          const buildData = await api.getBuildStatus(item.id);

          let deploymentData: any = null;
          // If build has deployment link, fetch deployment status to get pipeline info
          if (buildData.deploymentLink?.href) {
            const deploymentId = extractDeploymentId(
              buildData.deploymentLink.href
            );
            if (deploymentId) {
              try {
                deploymentData = await api.getDeploymentStatus(deploymentId);
              } catch (deploymentError) {
                console.warn(
                  `Failed to fetch deployment status for deployment ${deploymentId}:`,
                  deploymentError
                );
              }
            }
          }

          return {
            id: item.id,
            status: buildData.status,
            updated: buildData.updated,
            pipelineLink: buildData.pipelineLink,
            deploymentLink: buildData.deploymentLink, // Keep original deployment link
            deploymentPipelineLink:
              deploymentData?.pipeline?.processPipelineLink ||
              item.deploymentPipelineLink,
            deploymentError: buildData.deploymentError,
            deploymentStatus:
              deploymentData?.status || getDefaultDeploymentStatus(buildData)
          };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          const is401 = message.includes('HTTP 401');

          if (is401) {
            setShowTokenModal(true);
            return;
          }
          console.error(
            `Failed to refresh status for build ${item.id}:`,
            error
          );
          Notification.error(`Failed to refresh status for build ${item.id}`, {
            autoClose: false
          });
          return { id: item.id, status: item.status }; // Keep current status on error
        }
      });

      const refreshedData = await Promise.all(refreshPromises);
      const refreshMap = new Map(refreshedData.map(item => [item?.id, item]));

      // Combine fresh data with updated statuses
      // Only update items that actually have status changes
      const updatedItems = freshAllItems.map(item => {
        const refreshedItem = refreshMap.get(item.id);
        if (
          refreshedItem &&
          (refreshedItem.status !== item.status ||
            refreshedItem.deploymentStatus !== item.deploymentStatus)
        ) {
          return {
            ...item,
            status: refreshedItem.status,
            updated: refreshedItem.updated || item.updated,
            pipelineLink: refreshedItem.pipelineLink || item.pipelineLink,
            deploymentLink: refreshedItem.deploymentLink || item.deploymentLink,
            deploymentPipelineLink:
              refreshedItem.deploymentPipelineLink ||
              item.deploymentPipelineLink,
            deploymentError:
              refreshedItem.deploymentError || item.deploymentError,
            deploymentStatus:
              refreshedItem.deploymentStatus || item.deploymentStatus
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

      if (
        newItems.length > 0 ||
        refreshedData.some(
          item => item?.status !== items.find(i => i.id === item?.id)?.status
        )
      ) {
        console.log('Refresh completed with updates');
      } else {
        console.log('Refresh completed - no changes detected');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const is401 = message.includes('HTTP 401');

      if (is401) {
        setShowTokenModal(true);
        return;
      }
      console.error('Error during refresh:', error);
      Notification.error(`Error during refresh: ${error}`, {
        autoClose: false
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  /**
   * Initial data loading function called on component mount
   * Fetches builds and then asynchronously loads deployment data
   */
  const fetchData = async () => {
    try {
      const buildsResponse = await api.getBuilds();

      // Transform builds, preserving any existing deployment data
      const buildItems = transformBuildsToItems(buildsResponse.builds, items);

      // Sort by created date (most recent first)
      const sortedItems = buildItems.sort((a, b) => {
        const dateA = new Date(a.created).getTime();
        const dateB = new Date(b.created).getTime();
        return dateB - dateA;
      });

      setItems(sortedItems);

      // Fetch deployment data asynchronously for builds with deployment links
      // This updates deployment statuses from "Loading..." to actual values
      const itemsWithDeploymentData =
        await fetchDeploymentDataForBuilds(sortedItems);
      setItems(itemsWithDeploymentData);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const is401 = message.includes('HTTP 401');

      if (is401) {
        setShowTokenModal(true);
        return;
      }
      Notification.error(`Failed to load builds: ${err}`, { autoClose: false });
    }
  };

  // useEffect(() => {
  //   fetchData();
  // }, [maapApiUrl, maapToken]);

  /**
   * Returns Material-UI color theme for build status chips
   */
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

  /**
   * Returns Material-UI color theme for deployment status chips
   */
  const getDeploymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'deployed':
      case 'successful':
      case 'success':
        return 'success';
      case 'failed':
      case 'error':
        return 'error';
      case 'running':
      case 'accepted':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'not started':
        return 'default'; // Grey color
      case 'n/a':
        return 'default';
      default:
        return 'default';
    }
  };

  // Table column definitions for Material React Table
  const columns = useMemo<MRT_ColumnDef<BuildDeploymentItem>[]>(
    () => [
      {
        accessorKey: 'type',
        header: 'Type',
        size: 80,
        Cell: ({ row }) => (
          <Chip label="Build" size="small" variant="outlined" color="primary" />
        )
      },
      {
        accessorKey: 'name',
        header: 'Name',
        size: 200
      },
      {
        accessorKey: 'status',
        header: 'Build Status',
        size: 150,
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={row.original.status}
              size="small"
              color={getStatusColor(row.original.status, row.original.type)}
            />
            {row.original.pipelineLink && (
              <Tooltip title="View Build Pipeline" placement="top" arrow>
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
          </Box>
        )
      },
      {
        accessorKey: 'deploymentStatus',
        header: 'Deployment Status',
        size: 180,
        Cell: ({ row }) => {
          const deploymentStatus = row.original.deploymentStatus;
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={deploymentStatus || 'Unknown'}
                size="small"
                color={getDeploymentStatusColor(deploymentStatus || 'Unknown')}
              />
              {row.original.deploymentPipelineLink && (
                <Tooltip title="View Deployment Pipeline" placement="top" arrow>
                  <IconButton
                    size="small"
                    onClick={() =>
                      window.open(
                        row.original.deploymentPipelineLink?.href,
                        '_blank'
                      )
                    }
                  >
                    <LaunchIcon fontSize="small" color="secondary" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          );
        }
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
      }
    ],
    []
  );

  // Material React Table configuration with custom styling and behavior
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
          My Builds
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
            <h4>Build Details</h4>
            <tbody>
              <tr>
                <td className="st-label-cell">ID</td>
                <td>{item.id}</td>
              </tr>
              <tr>
                <td className="st-label-cell">Build Status</td>
                <td>
                  <Chip
                    label={item.status}
                    size="small"
                    color={getStatusColor(item.status, item.type)}
                  />
                </td>
              </tr>
              {item.deploymentStatus && (
                <tr>
                  <td className="st-label-cell">Deployment Status</td>
                  <td>
                    <Chip
                      label={item.deploymentStatus}
                      size="small"
                      color={getDeploymentStatusColor(item.deploymentStatus)}
                    />
                  </td>
                </tr>
              )}
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

          {(item.pipelineLink || item.deploymentPipelineLink) && (
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
                {item.deploymentPipelineLink && (
                  <button
                    className="st-button"
                    onClick={() =>
                      window.open(item.deploymentPipelineLink?.href, '_blank')
                    }
                  >
                    View Deployment Pipeline
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
      <TokenModal
        open={showTokenModal}
        onClose={() => setShowTokenModal(false)}
        onSubmit={() => fetchData()}
      />
      <div
        className="ag-theme-stellar algorithms-table"
        style={{ height: '100%', width: '100%' }}
      >
        <MaterialReactTable table={table} />
      </div>
    </>
  );
};
