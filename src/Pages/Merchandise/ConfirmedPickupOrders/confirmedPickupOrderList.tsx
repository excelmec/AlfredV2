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
import { IOrder, ESelfPickupStatus } from 'Hooks/Merchandise/orderTypes';

function getRowId(row: IOrder) {
  return row.orderId;
}

export default function ConfirmedPickupOrdersListPage() {
  const { confirmedOrderList, fetchOrderList, loading, error, columns } = useOrderList();

  const [selfPickupStatusToShow, setSelfPickupStatusToShow] = useState<ESelfPickupStatus[]>([
    ESelfPickupStatus.ready_for_pickup,

    // Not showing picked up orders
  ]);
  const filteredOrderList = confirmedOrderList.filter((order) =>
    selfPickupStatusToShow.includes(order.selfpickupStatus),
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
                checked={selfPickupStatusToShow.includes(ESelfPickupStatus.not_ready_for_pickup)}
                size="small"
                onChange={() => {
                  setSelfPickupStatusToShow((prev) => {
                    if (prev.includes(ESelfPickupStatus.not_ready_for_pickup)) {
                      return prev.filter(
                        (status) => status !== ESelfPickupStatus.not_ready_for_pickup,
                      );
                    }
                    return [...prev, ESelfPickupStatus.not_ready_for_pickup];
                  });
                }}
              />
            }
            label="Show new orders"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={selfPickupStatusToShow.includes(ESelfPickupStatus.ready_for_pickup)}
                size="small"
                onChange={() => {
                  setSelfPickupStatusToShow((prev) => {
                    if (prev.includes(ESelfPickupStatus.ready_for_pickup)) {
                      return prev.filter((status) => status !== ESelfPickupStatus.ready_for_pickup);
                    }
                    return [...prev, ESelfPickupStatus.ready_for_pickup];
                  });
                }}
              />
            }
            label="Show ready for pick up orders"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={selfPickupStatusToShow.includes(ESelfPickupStatus.picked_up)}
                size="small"
                onChange={() => {
                  setSelfPickupStatusToShow((prev) => {
                    if (prev.includes(ESelfPickupStatus.picked_up)) {
                      return prev.filter((status) => status !== ESelfPickupStatus.picked_up);
                    }
                    return [...prev, ESelfPickupStatus.picked_up];
                  });
                }}
              />
            }
            label="Show picked up orders"
          />
        </div>
      </>
    );
  }

  return (
    <>
      <br />
      <Typography variant="h5" noWrap component="div">
        Confirmed Pickup Order List
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
