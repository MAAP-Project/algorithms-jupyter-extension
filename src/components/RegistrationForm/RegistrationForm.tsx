import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Input,
  Link
} from '@mui/material';
import '../../../style/ag-grid-stellar.css';
import '../../../style/table-theme-stellar.css';
import { registerAlgorithm } from '../../utils/api';

export const RegistrationForm = ({ jupyterApp }) => {
  const [showModal, setShowModal] = useState(false);
  const [token, setToken] = useState('');

  const handleClose = () => {
    setShowModal(false);
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
    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });
    // TODO: local storage/session storage?
    if (localStorage.hasOwnProperty('MAAP_PGT_TOKEN')) {
      const token = localStorage['MAAP_PGT_TOKEN'];
      localStorage.setItem(
        'MAAP_PGT_TOKEN',
        'PGT-468-yuLSppW3YCA1GMevGfx1y8gfpIQemxTJ3e-2d--XqV0CLK1YlJwOl8RIZg4o-NTRN5g-f60a6c0c154f'
      );
    } else {
      // Modal requesting token
      console.log('no token detected');
      setShowModal(true);
    }

    registerAlgorithm(formData);
  };

  return (
    <>
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
          <TextField
            autoFocus
            required
            margin="dense"
            id="token"
            name="token"
            label="MAAP PGT Token"
            type="text"
            fullWidth
            variant="standard"
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
          Algorithm Submission Form
        </Typography>
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <h3>Repository Information</h3>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Repository URL</TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      name="repository_url"
                      placeholder="Enter repository URL"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Repository Branch</TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      name="repository_branch"
                      placeholder="Enter repository branch"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Run Command</TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      name="run_command"
                      placeholder="Enter run command"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <h3>General Information</h3>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Algorithm Name</TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      name="algorithm_name"
                      placeholder="Enter algorithm name"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Algorithm Description</TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      name="algorithm_description"
                      placeholder="Enter algorithm description"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Disk Space (GB)</TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      name="disc_space"
                      placeholder="Enter disk space (GB)"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Minimum RAM</TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      name="min_ram"
                      placeholder="Enter minimum RAM"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Minimum Number of Cores</TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      name="min_cores"
                      placeholder="Enter minimum number of cores"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Container URL</TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      name="container_url"
                      placeholder="Enter container URL"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Box mt={4}>
              <Button type="submit" variant="contained" color="primary">
                Submit
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </>
  );
};
