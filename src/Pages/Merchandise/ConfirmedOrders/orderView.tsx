import { Box, Typography } from '@mui/material';
import OrderDataView from 'Components/Merchandise/Order/OrderView/OrderDataView';
import { useOrderEach } from 'Hooks/Merchandise/useOrderEach';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function OrderViewPage() {
  const { orderId } = useParams();
  const { order, loading, error, fetchOrder, updateOrderShippingStatus, updatingShippingStatus } =
    useOrderEach();

  useEffect(() => {
    fetchOrder(orderId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (loading) {
    return (
      <Typography variant="h5" noWrap component="div">
        Loading...
      </Typography>
    );
  }

  if (error) {
    return (
      <Typography variant="h5" noWrap component="div">
        {error}
      </Typography>
    );
  }

  return (
    <>
      <br />
      <Box>
        <Typography variant="h5" noWrap component="div">
          Order View
        </Typography>
      </Box>
      <br />
      <OrderDataView
        order={order!}
        updateOrderShippingStatus={updateOrderShippingStatus}
        updatingShippingStatus={updatingShippingStatus}
      />
      ,
    </>
  );
}
