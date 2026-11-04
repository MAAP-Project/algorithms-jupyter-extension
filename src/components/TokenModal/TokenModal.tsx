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
import {
  MAAP_PROFILE_TOKENS_URL,
  MAAP_PROFILE_TOKENS_URL_UAT
} from '../../constants';
import { useMaapContext } from '../../MaapContext';

type TokenModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit?: () => void | Promise<void>;
};

export const TokenModal = ({ open, onClose, onSubmit }: TokenModalProps) => {
  const { getLatestSettings, setMaapToken } = useMaapContext();
  const [profileUrl, setProfileUrl] = useState<string>(MAAP_PROFILE_TOKENS_URL);
  const [token, setToken] = useState<string>('');

  const handleSubmit = async () => {
    // Only save a non-empty token so the saved one is never cleared
    if (!token.trim()) {
      return;
    }
    await setMaapToken(token);
    if (onSubmit) {
      await onSubmit();
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    const resolveProfileUrl = async () => {
      try {
        const { maapApiUrl } = await getLatestSettings();
        setProfileUrl(
          maapApiUrl.includes('uat')
            ? MAAP_PROFILE_TOKENS_URL_UAT
            : MAAP_PROFILE_TOKENS_URL
        );
      } catch (err) {
        console.error('Failed to resolve MAAP profile URL:', err);
      }
    };

    if (open) {
      setToken('');
      resolveProfileUrl();
    }
  }, [open, getLatestSettings]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ backgroundColor: 'orange', color: 'white' }}>
        MAAP Token Required
      </DialogTitle>

      <DialogContent sx={{ paddingBottom: 0 }}>
        <DialogContentText>
          To access your builds and deployments, you need to provide your MAAP
          Token. You can get this token by visiting{' '}
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
          label="MAAP Token"
          type="password"
          fullWidth
          variant="outlined"
          value={token}
          onChange={e => setToken(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ mt: 2 }}
        />

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!token.trim()}
          >
            Set Token
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};
