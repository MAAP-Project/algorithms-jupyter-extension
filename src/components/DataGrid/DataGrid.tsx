import React, { useEffect, useState } from 'react';
import { useMemo } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef
} from 'material-react-table';
import {
  Box,
  Button,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import '../../../style/ag-grid-stellar.css';
import '../../../style/table-theme-stellar.css';
import { openRegisterAlgorithm } from '../../utils/utils';
import { getProcess, getProcesses } from '../../utils/api';
import { Process, ProcessDetailed } from '../../types/process';
import { ExpandedState } from '@tanstack/react-table';
// import "@nasa-jpl/react-stellar/dist/esm/stellar.css";

export const DataGrid = ({ jupyterApp }) => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());
  const [rowDetails, setRowDetails] = useState<
    Record<string, ProcessDetailed | null>
  >({});

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
          const detail = await getProcess(processResource);
          setRowDetails(prev => ({ ...prev, [added]: detail }));
        } catch (error) {
          console.error(`Failed to fetch details for ${added}:`, error);
          setRowDetails(prev => ({ ...prev, [added]: null }));
        }
      }
    }

    // Update Set based on added/removed rows
    const updatedSet = new Set(expandedRowIds);
    if (added) updatedSet.add(added);
    if (removed) updatedSet.delete(removed);
    setExpandedRowIds(updatedSet);
  };

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const data = await getProcesses();
        setProcesses(data);
      } catch (err) {
        console.error('Failed to load processes:', err);
      }
    };

    fetchProcesses();
  }, []);

  const columns = useMemo<MRT_ColumnDef<Process>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Algorithm Name',
        size: 50
      },
      {
        accessorKey: 'description',
        header: 'Description',
        Cell: ({ row }) => (
          <Box
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '500px'
            }}
          >
            {row.original.description}
          </Box>
        )
      },
      {
        accessorKey: 'author',
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
      },
      {
        accessorKey: 'actions',
        header: 'Actions',
        muiTableHeadCellProps: {
          align: 'center'
        },
        muiTableBodyCellProps: { align: 'center' },
        Cell: ({ row }) => (
          <Button
            variant="contained"
            style={{ textTransform: 'none', backgroundColor: '#1976d2' }}
          >
            Configure Job
          </Button>
        )
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
        <Button
          variant="contained"
          size="small"
          style={{
            textTransform: 'none',
            backgroundColor: 'green',
            marginLeft: '1rem'
          }}
          onClick={() => openRegisterAlgorithm(jupyterApp, null)}
        >
          Register New Algorithm
        </Button>
      </Box>
    ),
    renderDetailPanel: ({ row }) => {
      console.log('Row id: ', row.id);
      const processDetails = rowDetails[row.id];
      console.log('Inputs: ', processDetails?.inputs);

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
          <Table
            size="small"
            sx={{
              mb: 2,
              border: theme => `1px solid ${theme.palette.divider}`
            }}
          >
            <TableBody>
              <TableRow>
                <TableCell>Code Repository</TableCell>
                <TableCell>
                  <Link
                    href={processDetails.githubUrl}
                    underline="always"
                    sx={{
                      color: 'blue',
                      '&:visited': {
                        color: 'purple'
                      },
                      '&:hover': {
                        color: 'darkblue'
                      }
                    }}
                  >
                    {processDetails.githubUrl}
                  </Link>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Git Commit Hash</TableCell>
                <TableCell>{processDetails.gitCommitHash}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>CWL Link</TableCell>
                <TableCell>{processDetails.cwlLink}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>RAM Min</TableCell>
                <TableCell>{processDetails.ramMin}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Cores Min</TableCell>
                <TableCell>{processDetails.coresMin}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Base Command</TableCell>
                <TableCell>{processDetails.baseCommand}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          {processDetails.inputs ? (
            <Box>
              <Typography variant="h6" component="h5">
                Input Parameters
              </Typography>
              <Table
                size="small"
                sx={{ border: theme => `1px solid ${theme.palette.divider}` }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Default Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(processDetails.inputs).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell>{value.title}</TableCell>
                      <TableCell>{value.description}</TableCell>
                      <TableCell>{value.type}</TableCell>
                      <TableCell>{value.default ?? '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
