import React from 'react';
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

export type Input = {
  name: string;
  description: string;
  type: string;
  required?: string;
  defaultValue?: string;
};

export type Algorithm = {
  algorithmName: string;
  description: string;
  author: string;
  repositoryURL: string;
  runCommand: string;
  minRam: string;
  minCores: string;
  inputs?: Input[];
  actions?: string[];
};

export const data = [
  {
    algorithmName: 'algo1:main',
    description: 'my algorithm',
    author: 'Jane Doe',
    repositoryURL: 'https://github.com',
    runCommand: '/bin/run_algorithm.sh',
    minRam: '5',
    minCores: '1',
    inputs: [
      {
        name: 'input1',
        description: 'input 1',
        type: 'number'
      }
    ],
    actions: ['configureJob']
  },
  {
    algorithmName: 'zalgo1:main',
    description: 'my algorithm',
    author: 'Jane Doe',
    repositoryURL: 'https://github.com',
    runCommand: '/bin/execute.sh',
    minRam: '5',
    minCores: '5',
    inputs: [
      {
        name: 'input1',
        description: 'input 1',
        type: 'string'
      },
      {
        name: 'input2',
        description: 'input 2',
        type: 'string'
      },
      {
        name: 'input3',
        description: 'input 3',
        type: 'string'
      },
      {
        name: 'input4',
        description: 'input 4',
        type: 'string'
      }
    ],
    actions: ['configureJob']
  },
  {
    algorithmName: 'algo3:main',
    description: 'my algorithm',
    author: 'John Smith',
    repositoryURL: 'https://github.com',
    runCommand: '/bin/run_algorithm.sh',
    minRam: '1',
    minCores: '1',
    actions: ['configureJob']
  },
  {
    algorithmName: 'galgo1:main',
    description: 'my algorithm',
    author: 'John Smith',
    repositoryURL: 'https://github.com/MAAP-Project',
    runCommand: '/bin/run_algorithm.py',
    minRam: '10',
    minCores: '3',
    actions: ['configureJob']
  },
  {
    algorithmName: 'lalgo1:main',
    description: 'my algorithm',
    author: 'John Smith',
    repositoryURL: 'https://github.com',
    runCommand: '/bin/execute.sh',
    minRam: '20',
    minCores: '1',
    actions: ['configureJob']
  },
  {
    algorithmName: 'lalgo1:main',
    description: 'my algorithm',
    author: 'Bob Smith',
    repositoryURL: 'https://github.com',
    runCommand: '/bin/execute_algorithm.py',
    minRam: '1',
    minCores: '2',
    actions: ['configureJob']
  }
];

export const DataGrid = () => {
  const columns = useMemo<MRT_ColumnDef<Algorithm>[]>(
    () => [
      {
        accessorKey: 'algorithmName',
        header: 'Algorithm Name',
        size: 50
      },
      {
        accessorKey: 'description',
        header: 'Description'
      },
      {
        accessorKey: 'author',
        header: 'Author'
      },
      {
        accessorKey: 'actions',
        header: 'Actions',
        enableSorting: false,
        enableColumnFilter: false,
        muiTableHeadCellProps: {
          align: 'center'
        },
        Cell: ({ row }) => (
          // TODO: map all actions
          <Box
            sx={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}
          >
            {row.original.actions?.map((action, index) => (
              <Button
                key={index}
                variant="contained"
                size="small"
                sx={{ textTransform: 'none' }}
                onClick={() => {
                  console.log(
                    `Action: '${action}' on algorithm: '${row.original.algorithmName}'`
                  );
                }}
              >
                Configure Job
              </Button>
            ))}
          </Box>
        )
      }
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data,
    enableExpandAll: false,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    initialState: { density: 'compact' },
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
    muiExpandButtonProps: ({ row, table }) => ({
      sx: {
        transform: row.getIsExpanded() ? 'rotate(180deg)' : 'rotate(-90deg)',
        transition: 'transform 0.2s'
      }
    }),
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <Typography variant="h6" sx={{ ml: 2 }}>
          Algorithm Search and Discovery
        </Typography>
      </Box>
    ),
    renderDetailPanel: ({ row }) => (
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
          sx={{ mb: 2, border: theme => `1px solid ${theme.palette.divider}` }}
        >
          <TableBody>
            <TableRow>
              <TableCell>Code Repository</TableCell>
              <TableCell>
                <Link
                  href={row.original.repositoryURL}
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
                  {row.original.repositoryURL}
                </Link>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Minimum RAM</TableCell>
              <TableCell>{row.original.minRam}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Minimum Cores</TableCell>
              <TableCell>{row.original.minCores}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Run Command</TableCell>
              <TableCell>{row.original.runCommand}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        {row.original.inputs && row.original.inputs.length > 0 ? (
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
                  <TableCell>Required</TableCell>
                  <TableCell>Default Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {row.original.inputs.map((input, i) => (
                  <TableRow key={`${input.name}-${i}`}>
                    <TableCell>{input.name}</TableCell>
                    <TableCell>{input.description}</TableCell>
                    <TableCell>{input.type}</TableCell>
                    <TableCell>{input.required}</TableCell>
                    <TableCell>{input.defaultValue}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        ) : null}
      </Box>
    )
  });

  return (
    <div
      className="ag-theme-stellar algorithms-table"
      style={{ height: '100%', width: '100%' }}
    >
      <MaterialReactTable table={table} />
    </div>
  );
};
