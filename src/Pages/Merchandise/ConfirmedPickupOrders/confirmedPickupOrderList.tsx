import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon } from '@phosphor-icons/react';
import { useOrderList } from 'Hooks/Merchandise/useOrderList';
import { IOrder, ESelfPickupStatus } from 'Hooks/Merchandise/orderTypes';
import { PageHeader } from '@/Components/page-header';
import { PageError } from '@/Components/page-state';
import { StatusFilter } from '@/Components/status-filter';
import { DataTable } from '@/Components/data-table/DataTable';
import { RowAction } from '@/Components/data-table/RowAction';
import type { DataColumn } from '@/Components/data-table/types';

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

  const tableColumns: DataColumn<IOrder>[] = [
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 70,
      getActions: (params) => [
        <RowAction
          key="view"
          icon={<EyeIcon />}
          label="View"
          tone="primary"
          onClick={() => navigate(`/merch/orders/view/${params.row.orderId}`)}
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
    return <PageError>{error}</PageError>;
  }

  return (
    <>
      <PageHeader
        title="Confirmed pickup orders"
        description="Paid orders that the customer collects themselves."
      />
      <StatusFilter
        selected={selfPickupStatusToShow}
        onChange={setSelfPickupStatusToShow}
        options={[
          { value: ESelfPickupStatus.not_ready_for_pickup, label: 'Show new orders' },
          { value: ESelfPickupStatus.ready_for_pickup, label: 'Show ready for pick up orders' },
          { value: ESelfPickupStatus.picked_up, label: 'Show picked up orders' },
        ]}
      />
      <DataTable
        columns={tableColumns}
        rows={filteredOrderList}
        getRowId={getRowId}
        loading={loading}
        exportFileName="confirmed-pickup-orders"
        searchPlaceholder="Search orders..."
        initialColumnVisibility={{ orderStatus: false, paymentStatus: false }}
        initialSorting={[{ id: 'orderDate', desc: true }]}
      />
    </>
  );
}
