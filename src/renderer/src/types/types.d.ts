import { VIEWS_SUPPORTED } from '../consts';

export type ViewsSupported =
  (typeof VIEWS_SUPPORTED)[keyof typeof VIEWS_SUPPORTED];
