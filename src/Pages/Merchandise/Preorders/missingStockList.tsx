import { Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect } from 'react';
import { useMissingStockList } from 'Hooks/Merchandise/useMissingStockList';

function getRowId(row: any) {
  return `${row.itemId}-${row.colorOption}-${row.sizeOption}`;
}

export default function MissingStockList() {
  const { missingStockList, loading, error, columns, fetchMissingStockList } =
    useMissingStockList();

  useEffect(() => {
    fetchMissingStockList();
  }, []);

  if (error) {
    return <Typography variant="h5">{error}</Typography>;
  }

  return (
    <>
      <br />
      <Typography variant="h5" noWrap component="div">
        Missing Stock
      </Typography>
      <br />

      <DataGrid
        density="compact"
        getRowId={getRowId}
        rows={missingStockList}
        columns={columns}
        loading={loading}
        sx={{ width: '90%' }}
        autoPageSize
        showCellVerticalBorder
        showColumnVerticalBorder
        rowHeight={60}
      />
    </>
  );
}
