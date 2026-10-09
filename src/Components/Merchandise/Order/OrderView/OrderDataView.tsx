import { useState } from 'react';
import { FloppyDiskIcon, QuestionIcon } from '@phosphor-icons/react';
import { ESelfPickupStatus, EShippingStatus, IOrder } from 'Hooks/Merchandise/orderTypes';
import { DetailCard } from '@/Components/detail-card';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { Spinner } from '@/Components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';

function StatusBadge({ value, bad }: { value: string; bad: boolean }) {
  return bad ? (
    <Badge variant="destructive">{value}</Badge>
  ) : (
    <Badge variant="secondary">{value}</Badge>
  );
}

export default function OrderDataView({
  order,
  updateOrderShippingStatus,
  updatingShippingStatus,
  updateOrderSelfPickupStatus,
  updatingSelfPickupStatus,
}: {
  order: IOrder;
  updateOrderShippingStatus: (orderId: string, shippingStatus: string, trackingId?: string) => void;
  updatingShippingStatus: boolean;
  updateOrderSelfPickupStatus: (orderId: string, selfPickupStatus: string) => void;
  updatingSelfPickupStatus: boolean;
}) {
  const [newShippingStatus, setNewShippingStatus] = useState<EShippingStatus>(order.shippingStatus);
  const [newTrackingId, setNewTrackingId] = useState<string | undefined>(order.trackingId);
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false);
  const [shippingStatusHelpDialogOpen, setShippingStatusHelpDialogOpen] = useState(false);
  const [newSelfPickupStatus, setNewSelfPickupStatus] = useState<ESelfPickupStatus>(
    order.selfpickupStatus,
  );
  const [selfPickupDialogOpen, setSelfPickupDialogOpen] = useState(false);
  const [selfPickupStatusHelpDialogOpen, setSelfPickupStatusHelpDialogOpen] = useState(false);

  const handleShippingDialogClose = () => {
    if (updatingShippingStatus) {
      return;
    }
    setNewShippingStatus(order.shippingStatus);
    setNewTrackingId(order.trackingId);
    setShippingDialogOpen(false);
  };

  const handleSelfPickupDialogClose = () => {
    if (updatingSelfPickupStatus) {
      return;
    }
    setNewSelfPickupStatus(order.selfpickupStatus);
    setSelfPickupDialogOpen(false);
  };

  const dateVal: Date =
    typeof order.orderDate.getMonth === 'function' ? order.orderDate : new Date(order.orderDate);
  const dateStr = dateVal.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  const totalAdditionalCharge = order.additionalCharges.reduce(
    (acc, charge) => acc + charge.chargeAmountInRs,
    0,
  );
  const actualOrderPrice = order.totalAmountInRs - totalAdditionalCharge;

  const canUpdateStatus = !updatingShippingStatus && order.orderStatus === 'order_confirmed';

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <DetailCard
          title="Order details"
          items={[
            {
              label: 'Order ID',
              value: <span className="font-mono text-xs">{order.orderId}</span>,
            },
            { label: 'Order date time', value: dateStr },
            {
              label: 'Order address',
              value: order.address?.split('\n').map((line, index) => <div key={index}>{line}</div>),
            },
            {
              label: 'Razorpay order ID',
              value: <span className="font-mono text-xs">{order.razOrderId}</span>,
            },
            { label: 'Actual order price', value: `${actualOrderPrice} Rs` },
            { label: 'Total amount paid by user', value: `${order.totalAmountInRs} Rs` },
            {
              label: 'Additional charges',
              value:
                order.additionalCharges.length === 0 ? (
                  'No additional charges'
                ) : (
                  <ul className="space-y-0.5">
                    {order.additionalCharges.map((charge, index) => (
                      <li key={index} className="flex justify-between gap-4">
                        <span>{charge.chargeType}</span>
                        <span className="tabular-nums">{`${charge.chargeAmountInRs} Rs`}</span>
                      </li>
                    ))}
                  </ul>
                ),
            },
          ]}
        />

        <DetailCard
          title="Order status"
          items={[
            {
              label: 'Delivery tracking ID',
              value: order.trackingId ?? (
                <span className="text-muted-foreground">No tracking ID was provided</span>
              ),
            },
            {
              label: 'Order status',
              value: (
                <StatusBadge
                  value={order.orderStatus}
                  bad={order.orderStatus !== 'order_confirmed'}
                />
              ),
            },
            {
              label: 'Payment status',
              value: (
                <StatusBadge
                  value={order.paymentStatus}
                  bad={order.paymentStatus !== 'payment_received'}
                />
              ),
            },
            order.isSelfPickup
              ? {
                  label: 'Pickup status',
                  value: <StatusBadge value={order.selfpickupStatus} bad={false} />,
                }
              : {
                  label: 'Shipping status',
                  value: (
                    <StatusBadge
                      value={order.shippingStatus}
                      bad={
                        order.shippingStatus === 'not_shipped' ||
                        order.shippingStatus === 'processing'
                      }
                    />
                  ),
                },
            {
              label: 'Actions',
              value: (
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={!canUpdateStatus}
                    onClick={() =>
                      order.isSelfPickup
                        ? setSelfPickupDialogOpen(true)
                        : setShippingDialogOpen(true)
                    }
                  >
                    {order.isSelfPickup ? 'Update pickup status' : 'Update shipping status'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      order.isSelfPickup
                        ? setSelfPickupStatusHelpDialogOpen(true)
                        : setShippingStatusHelpDialogOpen(true)
                    }
                  >
                    <QuestionIcon /> Help
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </div>

      <DetailCard
        title="User details"
        columns={3}
        items={[
          { label: 'User name', value: order.user?.name },
          { label: 'User email', value: order.user?.email },
          { label: 'User phone', value: order.user?.phoneNumber },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Order items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Item name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Price each</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.orderItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.item.name}</TableCell>
                    <TableCell>{item.sizeOption}</TableCell>
                    <TableCell>{item.colorOption}</TableCell>
                    <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                    <TableCell className="text-right tabular-nums">{`${item.price} Rs`}</TableCell>
                    <TableCell className="text-right tabular-nums">{`${item.price * item.quantity} Rs`}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={shippingDialogOpen}
        onOpenChange={(open) => !open && handleShippingDialogClose()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update shipping status</DialogTitle>
            <DialogDescription>Set the shipping status and tracking ID.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>Shipping status</Label>
              <Select
                value={newShippingStatus}
                onValueChange={(v) => setNewShippingStatus(v as EShippingStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(EShippingStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="trackingId">Tracking ID</Label>
              <Input
                id="trackingId"
                disabled={updatingShippingStatus}
                value={newTrackingId ?? ''}
                onChange={(e) => setNewTrackingId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter the tracking ID of the shipment. This will be shown to the user.
              </p>
            </div>
            {newShippingStatus === 'shipping' && order.shippingStatus !== 'shipping' && (
              <Alert variant="destructive">
                <AlertDescription>
                  Warning: The user will get a notification stating that the order has been shipped.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleShippingDialogClose}
              disabled={updatingShippingStatus}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                updateOrderShippingStatus(order.orderId, newShippingStatus, newTrackingId)
              }
              disabled={updatingShippingStatus}
            >
              {updatingShippingStatus ? <Spinner /> : <FloppyDiskIcon />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={selfPickupDialogOpen}
        onOpenChange={(open) => !open && handleSelfPickupDialogClose()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update pickup status</DialogTitle>
            <DialogDescription>Set the self pickup status of this order.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label>Pickup status</Label>
            <Select
              value={newSelfPickupStatus}
              onValueChange={(v) => setNewSelfPickupStatus(v as ESelfPickupStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ESelfPickupStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleSelfPickupDialogClose}
              disabled={updatingSelfPickupStatus}
            >
              Cancel
            </Button>
            <Button
              onClick={() => updateOrderSelfPickupStatus(order.orderId, newSelfPickupStatus)}
              disabled={updatingSelfPickupStatus}
            >
              {updatingSelfPickupStatus ? <Spinner /> : <FloppyDiskIcon />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={selfPickupStatusHelpDialogOpen}
        onOpenChange={setSelfPickupStatusHelpDialogOpen}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Help</DialogTitle>
            <DialogDescription>
              <strong>Pickup status</strong> is the status of self pickup. It can be one of the
              following:
            </DialogDescription>
          </DialogHeader>
          <ul className="list-disc space-y-2 pl-5 text-sm">
            <li>
              <strong>not_ready_for_pickup</strong> - There isn't either enough stock or the order
              is simply not ready for pickup
            </li>
            <li>
              <strong>ready_for_pickup</strong> - The order is ready for pickup by the customer. For
              preorders, it gets automatically set when enough stock becomes available. For other
              orders, it has to be manually set.
            </li>
            <li>
              <strong>picked_up</strong> - The order has been picked up. No further action is
              required.
            </li>
          </ul>
          <p className="text-sm">
            <strong>Status flow:</strong> not_ready_for_pickup → ready_for_pickup → picked_up
          </p>
          <DialogFooter>
            <Button onClick={() => setSelfPickupStatusHelpDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={shippingStatusHelpDialogOpen} onOpenChange={setShippingStatusHelpDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Help</DialogTitle>
            <DialogDescription>
              <strong>Shipping status</strong> is the status of the shipping. It can be one of the
              following:
            </DialogDescription>
          </DialogHeader>
          <ul className="list-disc space-y-2 pl-5 text-sm">
            <li>
              <strong>not_shipped</strong> - The order has not been shipped. This is the default
              status.
            </li>
            <li>
              <strong>processing</strong> - The order is being processed for shipping. Once the
              merch managing team has acknowledged the order, please set this status. No
              notification will be sent to the user.
            </li>
            <li>
              <strong>shipping</strong> - The order has been shipped. The user will get a
              notification stating that the order has been shipped. Please provide the tracking ID
              of the shipment.
            </li>
            <li>
              <strong>delivered</strong> - The order has been delivered. No further action is
              required.
            </li>
          </ul>
          <p className="text-sm">
            <strong>Tracking ID</strong> - This is the tracking ID of the shipment. This will be
            shown to the user.
          </p>
          <p className="text-sm">
            <strong>Status flow:</strong> not_shipped → processing → shipping → delivered
          </p>
          <DialogFooter>
            <Button onClick={() => setShippingStatusHelpDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
