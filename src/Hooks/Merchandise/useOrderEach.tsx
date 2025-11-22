import { useContext, useState } from 'react';
import { ApiContext } from 'Contexts/Api/ApiContext';
import { getErrMsg } from 'Hooks/errorParser';
import { IOrder } from './orderTypes';

export function useOrderEach() {
  const [order, setOrder] = useState<IOrder>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [updatingShippingStatus, setUpdatingShippingStatus] = useState<boolean>(false);

  const { axiosMerchPrivate } = useContext(ApiContext);

  async function fetchOrder(orderId: string | undefined) {
    try {
      if (!orderId) {
        throw new Error('Order ID not found');
      }

      setLoading(true);
      setError('');

      const response = await axiosMerchPrivate.get<{
        order: IOrder;

        // These are currently not used
        razorpayOrder: any;
        razorpayPayments: any;
      }>(`/admin/orders/${orderId}`);

      setOrder(response.data?.order);
    } catch (error) {
      setError(getErrMsg(error));
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderShippingStatus(
    orderId: string,
    shippingStatus: string,
    trackingId?: string,
  ) {
    try {
      setUpdatingShippingStatus(true);
      setError('');

      await axiosMerchPrivate.put(`/admin/orderStatus/${orderId}`, {
        shippingStatus,
        trackingId,
      });

      await fetchOrder(orderId);
    } catch (error) {
      setError(getErrMsg(error));
    } finally {
      setUpdatingShippingStatus(false);
    }
  }

  return {
    order,
    loading,
    error,
    fetchOrder,
    updateOrderShippingStatus,
    updatingShippingStatus,
  } as const;
}
