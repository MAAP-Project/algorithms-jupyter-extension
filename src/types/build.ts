export type Link = {
  href: string;
  rel: string;
  type: string;
  hreflang: string;
  title: string;
};

export type PipelineLink = {
  href: string;
  rel: string;
  type: string;
  hreflang: string;
  title: string;
};

export type DeploymentLink = {
  href: string;
  rel: string;
  type: string;
  hreflang: string;
  title: string;
};

export type Build = {
  build_id: string;
  status: string;
  created: string;
  updated?: string;
  repository_url: string;
  branch_ref: string;
  links: Link[];
  pipelineLink?: PipelineLink;
  deploymentLink?: DeploymentLink;
  deploymentPipelineLink?: DeploymentLink;
  deploymentError?: string;
  deploymentStatus?: string;
};

export type BuildsResponse = {
  builds: Build[];
};

// Shape of each entry returned by GET /ogc/deploymentJobs
export type Deployment = {
  created?: string; // e.g. "2026-10-27 15:33:29.933517" (no timezone)
  status: string;
  pipeline?: {
    executionVenue?: string;
    pipelineId?: number;
    processPipelineLink?: PipelineLink;
  };
  cwl?: Link;
  links?: DeploymentLink;
  processLocation?: Link;
};

export type DeploymentsResponse = {
  deploymentJobs: Deployment[];
  total?: number;
};

export type BuildDeploymentItem = {
  id: string;
  type: 'build' | 'deployment';
  name: string;
  status: string;
  created: string;
  updated?: string;
  repository_url?: string;
  version?: string;
  links: Link[];
  pipelineLink?: PipelineLink;
  deploymentLink?: DeploymentLink;
  deploymentPipelineLink?: DeploymentLink;
  deploymentError?: string;
  deploymentStatus?: string;
  description?: string;
  author?: string;
  algorithmId?: string;
  cwlLink?: Link;
};
