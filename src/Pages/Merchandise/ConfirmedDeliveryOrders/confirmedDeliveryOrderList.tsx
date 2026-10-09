import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon } from '@phosphor-icons/react';
import { useOrderList } from 'Hooks/Merchandise/useOrderList';
import { IOrder, EShippingStatus } from 'Hooks/Merchandise/orderTypes';
import { PageHeader } from '@/Components/page-header';
import { PageError } from '@/Components/page-state';
import { StatusFilter } from '@/Components/status-filter';
import { DataTable } from '@/Components/data-table/DataTable';
import { RowAction } from '@/Components/data-table/RowAction';
import type { DataColumn } from '@/Components/data-table/types';

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
        title="Confirmed delivery orders"
        description="Paid orders that are shipped to the customer."
      />
      <StatusFilter
        selected={shippingStatusToShow}
        onChange={setShippingStatusToShow}
        options={[
          { value: EShippingStatus.not_shipped, label: 'Show new orders' },
          { value: EShippingStatus.processing, label: 'Show processing orders' },
          { value: EShippingStatus.shipping, label: 'Show shipping orders' },
          { value: EShippingStatus.delivered, label: 'Show delivered orders' },
        ]}
      />
      <DataTable
        columns={tableColumns}
        rows={filteredOrderList}
        getRowId={getRowId}
        loading={loading}
        exportFileName="confirmed-delivery-orders"
        searchPlaceholder="Search orders..."
        initialColumnVisibility={{ orderStatus: false, paymentStatus: false }}
        initialSorting={[{ id: 'orderDate', desc: true }]}
      />
    </>
  );
}
