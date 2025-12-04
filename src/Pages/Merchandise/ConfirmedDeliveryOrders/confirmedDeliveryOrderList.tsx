import { Checkbox, FormControlLabel, Typography } from '@mui/material';

import {
  DataGrid,
  GridActionsCellItem,
  GridRowParams,
  GridToolbar,
  GridToolbarContainer,
} from '@mui/x-data-grid';

import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import VisibilityIcon from '@mui/icons-material/Visibility';
import { useOrderList } from 'Hooks/Merchandise/useOrderList';
import { IOrder, EShippingStatus } from 'Hooks/Merchandise/orderTypes';

function getRowId(row: IOrder) {
  return row.orderId;
}

export default function ConfirmedDeliveryOrdersListPage() {
  const { confirmedOrderList, fetchOrderList, loading, error, columns } = useOrderList();

  const [shippingStatusToShow, setShippingStatusToShow] = useState<EShippingStatus[]>([
    EShippingStatus.not_shipped,
    EShippingStatus.processing,
    EShippingStatus.shipping,

    // Not showing shipped orders
  ]);
  const filteredOrderList = confirmedOrderList.filter((order) =>
    shippingStatusToShow.includes(order.shippingStatus),
  );

  const navigate = useNavigate();

  const muiColumns = [
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 70,
      getActions: (params: GridRowParams<IOrder>) => [
        <GridActionsCellItem
          icon={<VisibilityIcon color="primary" />}
          label="View"
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
    return <Typography variant="h5">{error}</Typography>;
  }

  function CustomToolbar() {
    return (
      <>
        <GridToolbarContainer>
          <GridToolbar />
        </GridToolbarContainer>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            fontSize: '0.8rem !important',
            padding: '0.2rem 1rem',
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={shippingStatusToShow.includes(EShippingStatus.not_shipped)}
                size="small"
                onChange={() => {
                  setShippingStatusToShow((prev) => {
                    if (prev.includes(EShippingStatus.not_shipped)) {
                      return prev.filter((status) => status !== EShippingStatus.not_shipped);
                    }
                    return [...prev, EShippingStatus.not_shipped];
                  });
                }}
              />
            }
            label="Show new orders"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={shippingStatusToShow.includes(EShippingStatus.processing)}
                size="small"
                onChange={() => {
                  setShippingStatusToShow((prev) => {
                    if (prev.includes(EShippingStatus.processing)) {
                      return prev.filter((status) => status !== EShippingStatus.processing);
                    }
                    return [...prev, EShippingStatus.processing];
                  });
                }}
              />
            }
            label="Show processing orders"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={shippingStatusToShow.includes(EShippingStatus.shipping)}
                size="small"
                onChange={() => {
                  setShippingStatusToShow((prev) => {
                    if (prev.includes(EShippingStatus.shipping)) {
                      return prev.filter((status) => status !== EShippingStatus.shipping);
                    }
                    return [...prev, EShippingStatus.shipping];
                  });
                }}
              />
            }
            label="Show shipping orders"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={shippingStatusToShow.includes(EShippingStatus.delivered)}
                size="small"
                onChange={() => {
                  setShippingStatusToShow((prev) => {
                    if (prev.includes(EShippingStatus.delivered)) {
                      return prev.filter((status) => status !== EShippingStatus.delivered);
                    }
                    return [...prev, EShippingStatus.delivered];
                  });
                }}
              />
            }
            label="Show delivered orders"
          />
        </div>
      </>
    );
  }

  return (
    <>
      <br />
      <Typography variant="h5" noWrap component="div">
        Confirmed Delivery Order List
      </Typography>
      <br />
      <DataGrid
        density="compact"
        getRowId={getRowId}
        rows={filteredOrderList}
        columns={muiColumns}
        loading={loading}
        sx={{
          width: '90%',
        }}
        autoPageSize
        slots={{ toolbar: CustomToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            printOptions: {
              hideFooter: true,
              hideHeader: true,
              hideToolbar: true,
            },
          },
        }}
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
