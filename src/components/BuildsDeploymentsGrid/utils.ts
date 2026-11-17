import { Build, BuildDeploymentItem, Deployment } from '../../types/build';
import { ProcessDetailed } from '../../types/process';

/**
 * Extracts the repository name from a git repository URL,
 * e.g. "https://github.com/org/my-algo.git" -> "my-algo"
 */
export const getRepoNameFromUrl = (repoUrl?: string): string | undefined => {
  const name = repoUrl
    ?.trim()
    .replace(/\/+$/, '')
    .split('/')
    .pop()
    ?.replace(/\.git$/, '');
  return name || undefined;
};

/**
 * Utility function to extract deployment ID from API href URLs
 * Handles both "/ogc/deploymentJobs/123" and "/api/ogc/deploymentJobs/123" formats
 */
export const extractDeploymentId = (deploymentHref: string): string | null => {
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
 * Extracts the algorithm (process) ID from a processLocation href
 * like "/ogc/processes/388"
 */
export const extractAlgorithmId = (
  processHref?: string
): string | undefined => {
  const match = processHref?.match(/\/processes\/(\w+)/);
  return match ? match[1] : undefined;
};

/**
 * Derives a display name and version for a deployment from its CWL path,
 * since the deployment list endpoint does not return the process id/version.
 * The CWL href is a GitLab raw-file URL whose URL-encoded file path is
 * "<user>/<algorithm name>/<version>/process.cwl", e.g.
 * ".../repository/files/gchang%2Fhyp3-isce2%2Fv4.1.4%2Fprocess.cwl/raw"
 */
export const parseDeploymentCwlPath = (
  deployment: Deployment
): { name?: string; version?: string } => {
  const match = deployment.cwl?.href?.match(/\/repository\/files\/([^/]+)/);
  if (!match) {
    return {};
  }
  try {
    const segments = decodeURIComponent(match[1]).split('/');
    if (segments.length < 3) {
      return {};
    }
    return {
      name: segments[segments.length - 3],
      version: segments[segments.length - 2]
    };
  } catch {
    return {};
  }
};

/**
 * Normalizes a deployment timestamp like "2026-10-27 15:33:29.933517"
 * (no timezone, treated as UTC) into an ISO string that all browsers parse
 */
export const normalizeDeploymentDate = (created?: string): string => {
  if (!created) {
    return '';
  }
  const match = created.match(
    /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(\.\d{1,3})?\d*$/
  );
  const date = match
    ? new Date(`${match[1]}T${match[2]}${match[3] || ''}Z`)
    : new Date(created);
  return isNaN(date.getTime()) ? created : date.toISOString();
};

/**
 * Transforms deployment jobs that were not created by a build into grid items
 * (e.g. algorithms deployed directly from a CWL without going through a build)
 */
export const transformDeploymentsToItems = (
  deployments: Deployment[],
  builds: Build[],
  existingItems?: BuildDeploymentItem[]
): BuildDeploymentItem[] => {
  const existingItemsMap = new Map(
    (existingItems || []).map(item => [item.id, item])
  );

  const buildDeploymentIds = new Set(
    builds
      .map(build =>
        build.deploymentLink?.href
          ? extractDeploymentId(build.deploymentLink.href)
          : null
      )
      .filter(id => id !== null)
  );

  return deployments
    .map(deployment => ({
      deployment,
      deploymentId: deployment.links?.href
        ? extractDeploymentId(deployment.links.href)
        : null
    }))
    .filter(
      ({ deploymentId }) =>
        deploymentId !== null && !buildDeploymentIds.has(deploymentId)
    )
    .map(({ deployment, deploymentId }) => {
      const { name, version } = parseDeploymentCwlPath(deployment);
      const id = `deployment-${deploymentId}`;
      // Preserve repository info previously resolved from the process details
      const existingItem = existingItemsMap.get(id);
      const repoName = getRepoNameFromUrl(existingItem?.repository_url);
      return {
        id,
        type: 'deployment' as const,
        name: repoName || name || `Deployment ${deploymentId}`,
        version: existingItem?.repository_url ? existingItem.version : version,
        repository_url: existingItem?.repository_url,
        status: 'N/A',
        created: normalizeDeploymentDate(deployment.created),
        links: [],
        deploymentLink: deployment.links,
        deploymentPipelineLink: deployment.pipeline?.processPipelineLink,
        deploymentStatus: deployment.status,
        algorithmId: extractAlgorithmId(deployment.processLocation?.href),
        cwlLink: deployment.cwl
      };
    });
};

/**
 * Fills in the repository URL, repository name, and version of a
 * deployment-only row from its OGC process details, since the deployment
 * endpoints do not return the git repository the algorithm came from
 */
export const applyProcessDetailsToItem = (
  item: BuildDeploymentItem,
  process?: ProcessDetailed | null
): BuildDeploymentItem => {
  if (!process) {
    return item;
  }
  const repositoryUrl = process.githubUrl || item.repository_url;
  return {
    ...item,
    name: getRepoNameFromUrl(repositoryUrl) || item.name,
    repository_url: repositoryUrl,
    version: process.version || item.version
  };
};

/**
 * Returns the type chip label: whether the algorithm was built, deployed, or both
 */
export const getTypeLabel = (item: BuildDeploymentItem): string => {
  if (item.type === 'deployment') {
    return 'Deploy';
  }
  return item.deploymentLink ? 'Build & Deploy' : 'Build';
};

/**
 * Returns Material-UI color theme for type chips
 */
export const getTypeColor = (label: string) => {
  switch (label) {
    case 'Deploy':
      return 'secondary';
    case 'Build & Deploy':
      return 'info';
    default:
      return 'primary';
  }
};
