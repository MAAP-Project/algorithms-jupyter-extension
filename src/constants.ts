export const JUPYTER_EXT = {
  REGISTER_ALGORITHM_OPEN_COMMAND: 'register-algorithm-open-command'
};

// Fields for algo registration
// TODO: inputs should match what is needed to create the ogc cwl
export const algorithmFields = {
  repositoryURL: {
    title: 'Repository URL',
    placeHolder: 'Enter repository URL',
    description: 'The URL for the repository'
  },
  repositoryBranch: {
    title: 'Repository Branch',
    placeHolder: 'Enter repository branch',
    description: 'The repository branch'
  },
  runCommand: {
    title: 'Run Command',
    placeHolder: 'Enter run command',
    description: 'The algorithm run command'
  },
  algorithmName: {
    title: 'Algorithm Name',
    placeHolder: 'Enter algorithm name',
    description: 'The algorithm name'
  },
  algorithmDescription: {
    title: 'Algorithm Description',
    placeHolder: 'Enter algorithm description',
    description: 'The algorithm description'
  },
  containerURL: {
    title: 'Container URL',
    placeHolder: 'Enter container URL',
    description: 'The algorithm container URL'
  },
  discSpace: {
    title: 'Disc Space (GB)',
    placeHolder: 'Enter disc space',
    description: 'The disc space required to run the algorithm'
  },
  minRam: {
    title: 'Minimum RAM',
    placeHolder: 'Enter minimum RAM',
    description: 'Minimum RAM required'
  },
  minCoreNum: {
    title: 'Minimum Number of Cores',
    placeHolder: 'Enter minimum number of cores',
    description: 'Number of cores'
  }
};
