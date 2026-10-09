import { useMemo, useState, type ReactNode } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
  DownloadSimpleIcon,
  MagnifyingGlassIcon,
  TrayIcon,
} from '@phosphor-icons/react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { Skeleton } from '@/Components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { TooltipProvider } from '@/Components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { DataColumn } from './types';

interface DataTableProps<R> {
  columns: DataColumn<R>[];
  rows: R[];
  getRowId?: (row: R) => string | number;
  loading?: boolean;
  /** Show the quick-filter search box (default: true) */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Show the CSV export button (default: true) */
  exportable?: boolean;
  exportFileName?: string;
  pageSize?: number;
  onRowClick?: (row: R) => void;
  /** Extra controls rendered at the right of the toolbar */
  toolbar?: ReactNode;
  emptyMessage?: string;
  className?: string;
}

const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' } as const;
const pageSizes = [10, 25, 50, 100];

function formatValue(value: unknown): ReactNode {
  if (value === null || value === undefined || value === '') {
    return <span className="text-muted-foreground">—</span>;
  }
  if (value instanceof Date) return value.toLocaleString();
  if (typeof value === 'boolean') {
    return value ? (
      <Badge variant="secondary" className="bg-primary/10 text-primary">
        Yes
      </Badge>
    ) : (
      <Badge variant="outline" className="text-muted-foreground">
        No
      </Badge>
    );
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function plainText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toLocaleString();
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function DataTable<R>({
  columns,
  rows,
  getRowId,
  loading = false,
  searchable = true,
  searchPlaceholder = 'Search...',
  exportable = true,
  exportFileName = 'export',
  pageSize = 10,
  onRowClick,
  toolbar,
  emptyMessage = 'No results found.',
  className,
}: DataTableProps<R>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const cellValue = (col: DataColumn<R>, row: R) => {
    const raw = (row as any)?.[col.field];
    return col.valueGetter ? col.valueGetter({ row, value: raw, field: col.field }) : raw;
  };

  const tableColumns = useMemo<ColumnDef<R>[]>(
    () =>
      columns.map((col) => ({
        id: col.field,
        header: col.headerName ?? col.field,
        accessorFn: (row: R) => (col.type === 'actions' ? undefined : cellValue(col, row)),
        enableSorting: col.type !== 'actions' && col.sortable !== false,
        enableGlobalFilter: col.type !== 'actions',
        sortUndefined: 'last',
        meta: col,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columns],
  );

  const table = useReactTable({
    data: rows,
    columns: tableColumns,
    getRowId: getRowId ? (row) => String(getRowId(row)) : undefined,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) =>
      plainText(row.getValue(columnId)).toLowerCase().includes(String(filterValue).toLowerCase()),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const exportCsv = () => {
    const dataCols = columns.filter((c) => c.type !== 'actions');
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const lines = [
      dataCols.map((c) => escape(c.headerName ?? c.field)).join(','),
      ...table
        .getPrePaginationRowModel()
        .rows.map((r) =>
          dataCols.map((c) => escape(plainText(cellValue(c, r.original)))).join(','),
        ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportFileName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredCount = table.getFilteredRowModel().rows.length;
  const { pageIndex, pageSize: currentPageSize } = table.getState().pagination;
  const from = filteredCount === 0 ? 0 : pageIndex * currentPageSize + 1;
  const to = Math.min((pageIndex + 1) * currentPageSize, filteredCount);

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn('flex min-w-0 flex-col gap-3', className)}>
        {(searchable || exportable || toolbar) && (
          <div className="flex flex-wrap items-center gap-2">
            {searchable && (
              <div className="relative w-full max-w-xs">
                <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="pl-8"
                />
              </div>
            )}
            <div className="ml-auto flex items-center gap-2">
              {toolbar}
              {exportable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportCsv}
                  disabled={loading || rows.length === 0}
                >
                  <DownloadSimpleIcon /> Export
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id} className="hover:bg-transparent">
                  {group.headers.map((header) => {
                    const col = header.column.columnDef.meta as DataColumn<R>;
                    const sorted = header.column.getIsSorted();
                    const align = col.headerAlign ?? col.align ?? 'left';
                    return (
                      <TableHead
                        key={header.id}
                        title={col.description}
                        style={{ minWidth: col.minWidth ?? col.width, maxWidth: col.maxWidth }}
                        className={cn(
                          'h-10 text-xs font-semibold tracking-wide text-muted-foreground uppercase',
                          alignClass[align],
                        )}
                      >
                        {header.column.getCanSort() ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className={cn(
                              'inline-flex items-center gap-1 uppercase transition-colors hover:text-foreground',
                              sorted && 'text-foreground',
                            )}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {sorted === 'asc' && <ArrowUpIcon className="size-3" weight="bold" />}
                            {sorted === 'desc' && (
                              <ArrowDownIcon className="size-3" weight="bold" />
                            )}
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="hover:bg-transparent">
                    {columns.map((col) => (
                      <TableCell key={col.field}>
                        <Skeleton className="h-4 w-full max-w-[140px]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length} className="h-40 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <TrayIcon className="size-8 opacity-60" />
                      <span className="text-sm">{emptyMessage}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                    className={cn(onRowClick && 'cursor-pointer')}
                  >
                    {columns.map((col) => {
                      const raw = cellValue(col, row.original);
                      let content: ReactNode;
                      if (col.type === 'actions') {
                        const id = getRowId ? getRowId(row.original) : row.id;
                        content = (
                          <div
                            className={cn(
                              'flex items-center gap-0.5',
                              col.align === 'center' && 'justify-center',
                              col.align === 'right' && 'justify-end',
                            )}
                          >
                            {col.getActions?.({ row: row.original, id })}
                          </div>
                        );
                      } else if (col.renderCell) {
                        content = col.renderCell({
                          row: row.original,
                          value: (row.original as any)?.[col.field],
                          field: col.field,
                        });
                      } else if (col.valueFormatter) {
                        content = col.valueFormatter({ value: raw, field: col.field });
                      } else {
                        content = formatValue(raw);
                      }
                      return (
                        <TableCell
                          key={col.field}
                          style={{ maxWidth: col.maxWidth }}
                          className={cn(
                            col.type === 'number' && 'tabular-nums',
                            alignClass[col.align ?? 'left'],
                          )}
                        >
                          {content}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>
            {from}–{to} of {filteredCount}
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline">Rows per page</span>
              <Select
                value={String(currentPageSize)}
                onValueChange={(v) => table.setPageSize(Number(v))}
              >
                <SelectTrigger size="sm" className="w-[72px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(pageSizes.includes(pageSize) ? pageSizes : [pageSize, ...pageSizes]).map(
                    (n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="First page"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <CaretDoubleLeftIcon />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Previous page"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <CaretLeftIcon />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Next page"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <CaretRightIcon />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Last page"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <CaretDoubleRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
