import { Typography } from '@mui/material';

import {
  DataGrid,
  GridActionsCellItem,
  GridRowParams,
} from '@mui/x-data-grid';

import { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import VisibilityIcon from '@mui/icons-material/Visibility';
import { useOrderList } from 'Hooks/Merchandise/useOrderList';
import { IOrder } from 'Hooks/Merchandise/orderTypes';

function getRowId(row: IOrder) {
  return row.orderId;
}

export default function OrdersListPage() {
  const { preorderList, fetchOrderList, loading, error, columns } =
    useOrderList();

  const navigate = useNavigate();

  const muiColumns = [
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 70,
      getActions: (params: GridRowParams<IOrder>) => [
        <GridActionsCellItem
          icon={<VisibilityIcon color='primary' />}
          label='View'
          onClick={() => {
            navigate(`/merch/orders/view/${params.row.orderId}`);
          }}
        />,
      ],
    },
    ...columns,
  ];

  useEffect(() => {
    fetchOrderList();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return <Typography variant='h5'>{error}</Typography>;
  }

  return (
    <>
      <br />
      <Typography variant='h5' noWrap component='div'>
        Order List
      </Typography>
      <br />
      <DataGrid
        density='compact'
        getRowId={getRowId}
        rows={preorderList}
        columns={muiColumns}
        loading={loading}
        sx={{
          width: '90%',
        }}
        autoPageSize
        showCellVerticalBorder
        showColumnVerticalBorder
        rowHeight={60}
        initialState={{
          columns: {
            columnVisibilityModel: {
              // Hide orderStatus and paymentStatus, the other columns will remain visible
              orderStatus: false,
              paymentStatus: false,
            },
          },
          sorting: {
            sortModel: [{ field: 'orderDate', sort: 'desc' }],
          },
        }}
      />
    </>
  );
}
