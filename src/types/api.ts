// TODO check types against OGC standards -- nullable?

export type Link = {
  href: string;
  rel: string;
  type: string | null;
  hreflang: string | null;
  title: string;
};

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
