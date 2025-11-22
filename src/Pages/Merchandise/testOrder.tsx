import { Button, TextField, Typography } from '@mui/material';
import useRazorpay from 'react-razorpay';
import { useEffect, useState } from 'react';

const rzpKey = process.env.REACT_APP_RAZORPAY_KEY_ID;

export default function TestOrderPaymentPage() {
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState(0);

  const [Razorpay] = useRazorpay();
  async function payOrder() {
    if (!orderId) {
      return alert('Please enter an order ID');
    }
    if (amount <= 0) {
      return alert('Amount must be greater than 0');
    }

    if (!Razorpay) {
      return alert('Razorpay not loaded');
    }
    if (!rzpKey) {
      return alert('Razorpay key not set');
    }
    const rzpInstance = new Razorpay({
      key: rzpKey,
      name: 'Test Order | Excel MEC',
      currency: 'INR',
      order_id: orderId,
      amount: (amount * 100).toString(),

      handler: function (response) {
        alert(response.razorpay_payment_id);
        alert(response.razorpay_order_id);
        alert(response.razorpay_signature);
      },
    });

    rzpInstance.on('payment.failed', function (response: any) {
      alert(response.error.code);
      alert(response.error.description);
      alert(response.error.source);
      alert(response.error.step);
      alert(response.error.reason);
      alert(response.error.metadata.order_id);
      alert(response.error.metadata.payment_id);
    });

    rzpInstance.open();
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!rzpKey) {
    return (
      <>
        <br />
        <Typography variant="h5" noWrap component="div">
          TestOrderPayment
        </Typography>
        <br />
        <Typography variant="body1" noWrap component="div">
          Please set the RAZORPAY_KEY_ID environment variable in the env to test payments.
        </Typography>
        <br />
      </>
    );
  }

  return (
    <>
      <br />
      <Typography variant="h5" noWrap component="div">
        TestOrderPayment
      </Typography>
      <br />
      <TextField
        label="Order ID"
        variant="outlined"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
      />
      <br />
      <TextField
        label="Amount"
        variant="outlined"
        value={amount}
        onChange={(e) => {
          const val = parseInt(e.target.value);
          if (!isNaN(val)) {
            setAmount(val);
          } else {
            setAmount(0);
          }
        }}
      />
      <br />
      <Button size="small" variant="contained" onClick={payOrder}>
        Pay Order
      </Button>
      <br />
    </>
  );
}
