import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  TextField,
  Box,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  ArrowUpward as UpIcon
} from '@mui/icons-material';
import { IDefaultFileBrowser } from '@jupyterlab/filebrowser';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { IDocumentManager } from '@jupyterlab/docmanager';

interface ICustomFileDialogProps {
  open: boolean;
  onClose: () => void;
  onFileSelect: (fileContent: any) => void;
  jupyterApp: JupyterFrontEnd;
  fileBrowser: IDefaultFileBrowser;
  docManager: IDocumentManager;
}

interface IFileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  isConfigFile?: boolean;
}

export const CustomFileDialog: React.FC<ICustomFileDialogProps> = ({
  open,
  onClose,
  onFileSelect,
  jupyterApp
}) => {
  const [currentPath, setCurrentPath] = useState('/');
  const [files, setFiles] = useState<IFileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadFiles = async (path: string) => {
    setLoading(true);
    try {
      const { contents } = jupyterApp.serviceManager;
      const model = await contents.get(path, { content: true });

      if (model.type === 'directory' && model.content) {
        const fileItems: IFileItem[] = [];

        for (const item of model.content) {
          if (item.type === 'directory') {
            fileItems.push({
              name: item.name,
              path: item.path,
              type: 'directory'
            });
          } else if (item.type === 'file') {
            const name = item.name.toLowerCase();
            const isConfigFile =
              name.endsWith('.yaml') || name.endsWith('.yml');

            // Only add config files, skip other files
            if (isConfigFile) {
              fileItems.push({
                name: item.name,
                path: item.path,
                type: 'file',
                isConfigFile
              });
            }
          }
        }

        // Sort: directories first, then files
        fileItems.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'directory' ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });

        setFiles(fileItems);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadFiles(currentPath);
    }
  }, [open, currentPath]);

  const handleFileClick = async (file: IFileItem) => {
    if (file.type === 'directory') {
      setCurrentPath(file.path);
    } else if (file.isConfigFile) {
      try {
        const { contents } = jupyterApp.serviceManager;
        const fileModel = await contents.get(file.path, {
          type: 'file',
          content: true
        });

        // Parse YAML content
        const { parse } = await import('yaml');
        const parsedContent = parse(fileModel.content);

        onFileSelect(parsedContent);
        onClose();
      } catch (error) {
        console.error('Error reading file:', error);
      }
    }
  };

  const handleUpClick = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    setCurrentPath(parentPath);
  };

  const handleBreadcrumbClick = (path: string) => {
    setCurrentPath(path);
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pathParts = currentPath.split('/').filter(Boolean);
  const breadcrumbPaths = pathParts.map(
    (_, index) => '/' + pathParts.slice(0, index + 1).join('/')
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Select Algorithm Configuration File</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search files..."
            className="st-input"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            size="small"
            sx={{ mb: 1 }}
          />

          <Breadcrumbs>
            <Link
              component="button"
              variant="body2"
              onClick={() => handleBreadcrumbClick('/')}
              sx={{ cursor: 'pointer' }}
            >
              Home
            </Link>
            {pathParts.map((part, index) => (
              <Link
                key={index}
                component="button"
                variant="body2"
                onClick={() => handleBreadcrumbClick(breadcrumbPaths[index])}
                sx={{ cursor: 'pointer' }}
              >
                {part}
              </Link>
            ))}
          </Breadcrumbs>
        </Box>

        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {currentPath !== '/' && (
            <ListItem disablePadding>
              <ListItemButton onClick={handleUpClick}>
                <ListItemIcon>
                  <UpIcon />
                </ListItemIcon>
                <ListItemText primary=".." />
              </ListItemButton>
            </ListItem>
          )}

          {loading ? (
            <ListItem>
              <ListItemText primary="Loading..." />
            </ListItem>
          ) : (
            filteredFiles.map(file => (
              <ListItem key={file.path} disablePadding>
                <ListItemButton onClick={() => handleFileClick(file)}>
                  <ListItemIcon>
                    {file.type === 'directory' ? (
                      <FolderIcon color="primary" />
                    ) : (
                      <FileIcon color="success" />
                    )}
                  </ListItemIcon>
                  <ListItemText primary={file.name} />
                </ListItemButton>
              </ListItem>
            ))
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <button className="st-button" onClick={onClose}>
          Cancel
        </button>
      </DialogActions>
    </Dialog>
  );
};
