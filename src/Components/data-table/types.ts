import type { ReactElement, ReactNode } from 'react';

export interface CellParams<R = any, V = any> {
  row: R;
  value: V;
  field: string;
}

export type GridValueGetterParams<R = any, V = any> = CellParams<R, V>;
export type GridRenderCellParams<R = any, V = any> = CellParams<R, V>;
export type GridValueFormatterParams<V = any> = { value: V; field: string };
export type GridRowParams<R = any> = { row: R; id: string | number };

export interface DataColumn<R = any> {
  field: string;
  headerName?: string;
  type?: 'string' | 'number' | 'boolean' | 'date' | 'actions';
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  flex?: number;
  align?: 'left' | 'center' | 'right';
  headerAlign?: 'left' | 'center' | 'right';
  description?: string;
  sortable?: boolean;
  valueGetter?: (params: CellParams<R>) => any;
  valueFormatter?: (params: GridValueFormatterParams) => ReactNode;
  renderCell?: (params: CellParams<R>) => ReactNode;
  /** Only for `type: 'actions'` columns; return `<RowAction />` elements */
  getActions?: (params: GridRowParams<R>) => ReactElement[];
}
