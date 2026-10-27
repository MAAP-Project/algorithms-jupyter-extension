import {
  extractAlgorithmId,
  extractDeploymentId,
  getTypeColor,
  getTypeLabel,
  normalizeDeploymentDate,
  parseDeploymentCwlPath,
  transformDeploymentsToItems
} from '../utils';
import { Build, BuildDeploymentItem, Deployment } from '../../../types/build';

const CWL_HREF =
  'https://repo.uat.maap-project.org/api/v4/projects/197/repository/files/gchang%2Fhyp3-isce2%2Fv4.1.4-maap.1-test-ed477d7f%2Fprocess.cwl/raw';

const PIPELINE_LINK = {
  href: 'https://repo.uat.maap-project.org/root/deploy-ogc-hysds/-/pipelines/4923',
  rel: 'monitor',
  type: 'text/html',
  hreflang: 'en',
  title: 'Deploying Process Pipeline'
};

// Mirrors a real entry from GET /ogc/deploymentJobs
const deployment = (
  jobId: number | string,
  overrides: Partial<Deployment> = {}
): Deployment => ({
  created: '2026-10-27 15:33:29.933517',
  status: 'successful',
  pipeline: {
    executionVenue: 'gitlab',
    pipelineId: 4923,
    processPipelineLink: PIPELINE_LINK
  },
  cwl: {
    href: CWL_HREF,
    rel: 'service-desc',
    type: 'application/cwl',
    hreflang: 'en',
    title: 'Process Reference'
  },
  links: {
    href: `/ogc/deploymentJobs/${jobId}`,
    rel: 'self',
    type: 'application/json',
    hreflang: 'en',
    title: 'Deployment Link'
  },
  processLocation: {
    href: '/ogc/processes/388',
    rel: 'service-doc',
    type: 'application/json',
    hreflang: 'en',
    title: 'Process Location'
  },
  ...overrides
});

const build = (buildId: string, deploymentJobId?: number | string): Build => ({
  build_id: buildId,
  status: 'successful',
  created: '2026-10-27T15:00:00Z',
  repository_url: 'https://github.com/MAAP-Project/hyp3-isce2.git',
  branch_ref: 'main',
  links: [],
  ...(deploymentJobId !== undefined && {
    deploymentLink: {
      href: `/ogc/deploymentJobs/${deploymentJobId}`,
      rel: 'monitor',
      type: 'application/json',
      hreflang: 'en',
      title: 'Link to OGC process deployment'
    }
  })
});

const item = (
  overrides: Partial<BuildDeploymentItem> = {}
): BuildDeploymentItem => ({
  id: '1',
  type: 'build',
  name: 'algo',
  status: 'successful',
  created: '2026-10-27T15:00:00Z',
  links: [],
  ...overrides
});

describe('extractDeploymentId', () => {
  it.each([
    ['/ogc/deploymentJobs/615', '615'],
    ['/api/ogc/deploymentJobs/615', '615'],
    ['https://api.maap-project.org/api/ogc/deploymentJobs/abc123', 'abc123']
  ])('extracts the ID from %s', (href, expected) => {
    expect(extractDeploymentId(href)).toBe(expected);
  });

  it('returns null when the href is not a deployment job link', () => {
    expect(extractDeploymentId('/ogc/processes/388')).toBeNull();
  });
});

describe('extractAlgorithmId', () => {
  it('extracts the ID from a processLocation href', () => {
    expect(extractAlgorithmId('/ogc/processes/388')).toBe('388');
  });

  it('returns undefined when the href is missing', () => {
    expect(extractAlgorithmId(undefined)).toBeUndefined();
  });

  it('returns undefined when the href is not a process link', () => {
    expect(extractAlgorithmId('/ogc/deploymentJobs/615')).toBeUndefined();
  });
});

describe('parseDeploymentCwlPath', () => {
  it('derives name and version from a GitLab raw-file CWL href', () => {
    expect(parseDeploymentCwlPath(deployment(615))).toEqual({
      name: 'hyp3-isce2',
      version: 'v4.1.4-maap.1-test-ed477d7f'
    });
  });

  it('returns nothing when there is no CWL link', () => {
    expect(parseDeploymentCwlPath(deployment(615, { cwl: undefined }))).toEqual(
      {}
    );
  });

  it('returns nothing when the CWL href is not a GitLab repository file', () => {
    const cwl = { ...deployment(615).cwl!, href: 'https://example.com/a.cwl' };
    expect(parseDeploymentCwlPath(deployment(615, { cwl }))).toEqual({});
  });

  it('returns nothing when the file path has too few segments', () => {
    const cwl = {
      ...deployment(615).cwl!,
      href: 'https://repo/api/v4/projects/1/repository/files/process.cwl/raw'
    };
    expect(parseDeploymentCwlPath(deployment(615, { cwl }))).toEqual({});
  });

  it('returns nothing when the file path is malformed URL encoding', () => {
    const cwl = {
      ...deployment(615).cwl!,
      href: 'https://repo/api/v4/projects/1/repository/files/a%2Fb%2F%E0%A4%A/raw'
    };
    expect(parseDeploymentCwlPath(deployment(615, { cwl }))).toEqual({});
  });
});

describe('normalizeDeploymentDate', () => {
  it('converts a space-separated timestamp without timezone to UTC ISO', () => {
    expect(normalizeDeploymentDate('2026-10-27 15:33:29.933517')).toBe(
      '2026-10-27T15:33:29.933Z'
    );
  });

  it('handles timestamps without fractional seconds', () => {
    expect(normalizeDeploymentDate('2026-10-27 15:33:29')).toBe(
      '2026-10-27T15:33:29.000Z'
    );
  });

  it('passes through other parseable date formats', () => {
    expect(normalizeDeploymentDate('Tue, 27 Oct 2026 15:33:29 GMT')).toBe(
      '2026-10-27T15:33:29.000Z'
    );
  });

  it('returns unparseable values unchanged', () => {
    expect(normalizeDeploymentDate('not a date')).toBe('not a date');
  });

  it('returns an empty string when the date is missing', () => {
    expect(normalizeDeploymentDate(undefined)).toBe('');
  });
});

describe('transformDeploymentsToItems', () => {
  it('maps a deployment-only job to a deployment row', () => {
    expect(transformDeploymentsToItems([deployment(615)], [])).toEqual([
      {
        id: 'deployment-615',
        type: 'deployment',
        name: 'hyp3-isce2',
        version: 'v4.1.4-maap.1-test-ed477d7f',
        status: 'N/A',
        created: '2026-10-27T15:33:29.933Z',
        links: [],
        deploymentLink: deployment(615).links,
        deploymentPipelineLink: PIPELINE_LINK,
        deploymentStatus: 'successful',
        algorithmId: '388',
        cwlLink: deployment(615).cwl
      }
    ]);
  });

  it('excludes deployments that were created by a build', () => {
    const items = transformDeploymentsToItems(
      [deployment(615), deployment(616)],
      [build('b1', 615), build('b2')]
    );
    expect(items.map(i => i.id)).toEqual(['deployment-616']);
  });

  it('matches build deployment links that include the /api prefix', () => {
    const b = build('b1', 615);
    b.deploymentLink!.href = '/api/ogc/deploymentJobs/615';
    expect(transformDeploymentsToItems([deployment(615)], [b])).toEqual([]);
  });

  it('skips deployments without a usable self link', () => {
    expect(
      transformDeploymentsToItems([deployment(615, { links: undefined })], [])
    ).toEqual([]);
  });

  it('falls back to a generic name when the CWL path cannot be parsed', () => {
    const [row] = transformDeploymentsToItems(
      [deployment(615, { cwl: undefined })],
      []
    );
    expect(row.name).toBe('Deployment 615');
    expect(row.version).toBeUndefined();
    expect(row.cwlLink).toBeUndefined();
  });

  it('leaves the algorithm ID unset before a process has been created', () => {
    const [row] = transformDeploymentsToItems(
      [deployment(615, { status: 'running', processLocation: undefined })],
      []
    );
    expect(row.algorithmId).toBeUndefined();
    expect(row.deploymentStatus).toBe('running');
  });
});

describe('getTypeLabel', () => {
  it('labels a build without a deployment as Build', () => {
    expect(getTypeLabel(item())).toBe('Build');
  });

  it('labels a build with a deployment as Build & Deploy', () => {
    expect(
      getTypeLabel(item({ deploymentLink: build('b1', 615).deploymentLink }))
    ).toBe('Build & Deploy');
  });

  it('labels a deployment-only row as Deploy', () => {
    expect(getTypeLabel(item({ type: 'deployment' }))).toBe('Deploy');
  });
});

describe('getTypeColor', () => {
  it.each([
    ['Build', 'primary'],
    ['Deploy', 'secondary'],
    ['Build & Deploy', 'info']
  ])('uses %s -> %s', (label, color) => {
    expect(getTypeColor(label)).toBe(color);
  });
});
