import type { DataColumn } from '@/Components/data-table/types';

/** Column definition used by every list page; see Components/data-table */
export type TypeSafeColDef<T> = DataColumn<T>;
