export const VIEWS_SUPPORTED = {
  TREE: 'tree',
  SUMMARY: 'summary',
} as const;

export type ViewsSupported =
  (typeof VIEWS_SUPPORTED)[keyof typeof VIEWS_SUPPORTED];
