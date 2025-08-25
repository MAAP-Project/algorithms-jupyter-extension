export type Link = {
  href: string;
  rel: string;
  type: string | null;
  hreflang: string | null;
  title: string;
};

export type ProcessInput = {
  title: string;
  label: string;
  description: string;
  type: string;
  placeholder: string;
  default?: string;
};

export type InputObj = {
  [key: string]: ProcessInput;
};

// TODO: use this jargon for the registration form
export type Process = {
  title?: string;
  description?: string;
  keywords?: string[];
  metadata?: string[];
  id?: string;
  version?: string;
  jobControlOptions?: string[];
  author?: string;
  lastModifiedTime?: string;
  cwlLink?: string;
  links?: Link[];
};

export type ProcessDetailed = Process & {
  processID?: string;
  githubUrl?: string;
  gitCommitHash?: string;
  ramMin?: number;
  coresMin?: number;
  baseCommand?: string; // runCommand and baseCommand refer to the same thing
  inputs?: InputObj;
};
