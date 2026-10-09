import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon } from '@phosphor-icons/react';
import { useOrderList } from 'Hooks/Merchandise/useOrderList';
import { IOrder } from 'Hooks/Merchandise/orderTypes';
import { PageHeader } from '@/Components/page-header';
import { PageError } from '@/Components/page-state';
import { DataTable } from '@/Components/data-table/DataTable';
import { RowAction } from '@/Components/data-table/RowAction';
import type { DataColumn } from '@/Components/data-table/types';

function getRowId(row: IOrder) {
  return row.orderId;
}

export default function OrdersListPage() {
  const { preorderList, fetchOrderList, loading, error, columns } = useOrderList();

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
        title="Pre-orders"
        description="Orders placed for items that are not yet in stock."
      />
      <DataTable
        columns={tableColumns}
        rows={preorderList}
        getRowId={getRowId}
        loading={loading}
        exportFileName="preorders"
        searchPlaceholder="Search pre-orders..."
        initialColumnVisibility={{ orderStatus: false, paymentStatus: false }}
        initialSorting={[{ id: 'orderDate', desc: true }]}
      />
    </>
  );
}
