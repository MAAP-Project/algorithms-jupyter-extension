import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField
} from '@mui/material';
import { MAAP_PROFILE_URL } from '../../constants';
import { useMaapContext } from '../../MaapContext';

type TokenModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit?: () => void | Promise<void>;
};

export const TokenModal = ({ open, onClose, onSubmit }: TokenModalProps) => {
  const { getLatestSettings, setMaapToken } = useMaapContext();
  const [profileUrl, setProfileUrl] = useState<string>(MAAP_PROFILE_URL);

  const handleSubmit = async () => {
    if (onSubmit) {
      await onSubmit();
    }
    onClose();
  };

  useEffect(() => {
    const resolveProfileUrl = async () => {
      try {
        const { maapApiUrl } = await getLatestSettings();
        const maapEnv = new URL(maapApiUrl).hostname.split('.')[1];
        setProfileUrl(MAAP_PROFILE_URL.replace('{MAAP_ENV}', maapEnv));
      } catch (err) {
        console.error('Failed to resolve MAAP profile URL:', err);
      }
    };

    if (open) {
      resolveProfileUrl();
    }
  }, [open, getLatestSettings]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ backgroundColor: 'orange', color: 'white' }}>
        MAAP PGT Token Required
      </DialogTitle>

      <DialogContent sx={{ paddingBottom: 0 }}>
        <DialogContentText>
          To access your builds and deployments, you need to provide your MAAP
          PGT Token. You can get this token by visiting{' '}
          <a
            href={profileUrl}
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
          onChange={e => setMaapToken(e.target.value)}
          sx={{ mt: 2 }}
        />

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Set Token
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};
