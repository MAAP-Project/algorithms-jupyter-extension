# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a JupyterLab extension for MAAP (Multi-Mission Algorithm and Analysis Platform) that provides algorithm management capabilities. The extension consists of two main plugins:

- **List Algorithms**: View and browse OGC-compliant algorithms in a data grid
- **Register Algorithms**: Form-based interface for registering new algorithms with the MAAP platform

## Architecture

### Core Structure

- **Frontend**: TypeScript/React JupyterLab extension using Material-UI components
- **Backend Integration**: Python package that integrates with JupyterLab 4.0+
- **Build System**: Uses `jlpm` (JupyterLab's yarn), TypeScript compilation, and hatch for Python packaging

### Key Directories

- `src/` - TypeScript/React source code
  - `components/` - React components (DataGrid, RegistrationForm, CustomFileDialog)
  - `types/` - TypeScript type definitions for algorithm configs and processes
  - `utils/` - API utilities and helper functions
- `maap_algorithms_jupyter_extension/` - Python package directory
- `style/` - CSS stylesheets including custom Stellar design system styles
- `ui-tests/` - Playwright integration tests

### Main Components

- `AlgorithmsWidget`: Displays algorithm list using Material React Table
- `RegisterAlgorithmsWidget`: Form interface for algorithm registration
- Algorithm configuration follows OGC standards with inputs/outputs defined in YAML

## Development Commands

### Setup

```bash
# Install dependencies
jlpm

# Development install (links extension to JupyterLab)
pip install -e "."
jupyter labextension develop . --overwrite
```

### Building

```bash
# Development build
jlpm build

# Production build
jlpm build:prod

# Watch mode (rebuilds on changes)
jlpm watch
```

### Testing

```bash
# Run Jest unit tests
jlpm test

# Run integration tests (Playwright)
cd ui-tests && jlpm test
```

### Code Quality

```bash
# Run all linting and formatting
jlpm lint

# Individual tools
jlpm eslint          # TypeScript/JavaScript linting
jlpm prettier        # Code formatting
jlpm stylelint       # CSS linting
```

### Running JupyterLab

```bash
# Start JupyterLab with extension
jupyter lab
```

## Algorithm Configuration

The extension uses `algorithm_config.yml` files that define:

- Algorithm metadata (name, version, description)
- Runtime requirements (RAM, cores, container URLs)
- Input/output specifications following OGC standards
- Build and run commands for containerized execution

## Key Technologies

- **UI Framework**: React 18 + Material-UI 6 + NASA JPL Stellar design system
- **Data Display**: Material React Table for algorithm listings
- **JupyterLab APIs**: File browser, document manager, launcher integration
- **Testing**: Jest for unit tests, Playwright for E2E tests
- **Build Tools**: TypeScript, ESLint, Prettier, Stylelint

## TypeScript Configuration

- Interface naming convention: Must start with 'I' followed by PascalCase
- Single quotes enforced, no trailing commas
- Source maps enabled for debugging
