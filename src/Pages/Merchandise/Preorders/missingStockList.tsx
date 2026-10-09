import { useEffect } from 'react';
import { useMissingStockList } from 'Hooks/Merchandise/useMissingStockList';
import { PageHeader } from '@/Components/page-header';
import { PageError } from '@/Components/page-state';
import { DataTable } from '@/Components/data-table/DataTable';

function getRowId(row: any) {
  return `${row.itemId}-${row.colorOption}-${row.sizeOption}`;
}

export default function MissingStockList() {
  const { missingStockList, loading, error, columns, fetchMissingStockList } =
    useMissingStockList();

  useEffect(() => {
    fetchMissingStockList();
  }, [fetchMissingStockList]);

  if (error) {
    return <PageError>{error}</PageError>;
  }

  return (
    <>
      <PageHeader title="Missing stock" description="Quantities needed to fulfil all pre-orders." />
      <DataTable
        columns={columns}
        rows={missingStockList}
        getRowId={getRowId}
        loading={loading}
        exportFileName="missing-stock"
        searchPlaceholder="Search items..."
      />
    </>
  );
}
