import { VIEWS_SUPPORTED } from '../consts';

export type ViewsSupported =
  (typeof VIEWS_SUPPORTED)[keyof typeof VIEWS_SUPPORTED];

/**Interface para la estructura de datos que maneja la tabla internamente */
export interface TableRowData {
  key: string;
  sku: string;
  qty: string;
  lineNumber: string;
  erpOrder: string;
}
