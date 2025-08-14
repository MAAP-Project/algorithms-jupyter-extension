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
  deploymentError?: string;
};

export type BuildsResponse = {
  builds: Build[];
};

export type Deployment = {
  job_id: number;
  created?: string;
  status: string;
  execution_venue?: string;
  pipeline_id?: number;
  cwl_link: string;
  id: string;
  version: string;
  deployer: number;
  author?: string;
  process_id?: string;
  title?: string;
  description?: string;
  process_name_hysds?: string;
  keywords?: string;
  github_url?: string;
  git_commit_hash?: string;
  ram_min?: number;
  cores_min?: number;
  base_command?: string;
};

export type DeploymentsResponse = {
  deploymentJobs: Deployment[];
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
  deploymentError?: string;
  description?: string;
  author?: string;
};
