import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import OrderDataView from 'Components/Merchandise/Order/OrderView/OrderDataView';
import { useOrderEach } from 'Hooks/Merchandise/useOrderEach';
import { PageHeader } from '@/Components/page-header';
import { PageError, PageLoading } from '@/Components/page-state';

export default function OrderViewPage() {
  const { orderId } = useParams();
  const {
    order,
    loading,
    error,
    fetchOrder,
    updateOrderShippingStatus,
    updatingShippingStatus,
    updateOrderSelfPickupStatus,
    updatingSelfPickupStatus,
  } = useOrderEach();

  useEffect(() => {
    fetchOrder(orderId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError>{error}</PageError>;
  }

  return (
    <>
      <PageHeader title="Order" description="Order details, status and items." />
      <OrderDataView
        order={order!}
        updateOrderShippingStatus={updateOrderShippingStatus}
        updatingShippingStatus={updatingShippingStatus}
        updateOrderSelfPickupStatus={updateOrderSelfPickupStatus}
        updatingSelfPickupStatus={updatingSelfPickupStatus}
      />
    </>
  );
}
