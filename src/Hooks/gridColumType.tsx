import { GridColDef } from '@mui/x-data-grid';

export type TypeSafeColDef<T> = GridColDef &
  (
    | {
        field: keyof T | 'actions';
      }
    | {
        field?: string;
        valueGetter: (params: any) => string;
      }
    | {
        renderCell?: (params: { row: T; value: any }) => JSX.Element;
      }
  );
