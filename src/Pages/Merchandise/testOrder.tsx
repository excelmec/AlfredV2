import { toast } from 'sonner';
import { CreditCardIcon } from '@phosphor-icons/react';
import { PageHeader } from '@/Components/page-header';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import useRazorpay from 'react-razorpay';
import { useEffect, useState } from 'react';

const rzpKey = import.meta.env.REACT_APP_RAZORPAY_KEY_ID;

export default function TestOrderPaymentPage() {
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState(0);

  const [Razorpay] = useRazorpay();
  async function payOrder() {
    if (!orderId) {
      return void toast.error('Please enter an order ID');
    }
    if (amount <= 0) {
      return void toast.error('Amount must be greater than 0');
    }

    if (!Razorpay) {
      return void toast.error('Razorpay not loaded');
    }
    if (!rzpKey) {
      return void toast.error('Razorpay key not set');
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
        <PageHeader title="Test payment" />
        <p className="text-sm text-muted-foreground">
          Please set the REACT_APP_RAZORPAY_KEY_ID environment variable in the env to test payments.
        </p>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Test payment"
        description="Open the Razorpay checkout for an existing order to test payments."
      />
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Pay an order</CardTitle>
          <CardDescription>Enter the Razorpay order ID and the amount in rupees.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="test-order-id">Order ID</Label>
            <Input
              id="test-order-id"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="test-amount">Amount</Label>
            <Input
              id="test-amount"
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
          </div>
          <Button className="w-fit" onClick={payOrder}>
            <CreditCardIcon /> Pay order
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
