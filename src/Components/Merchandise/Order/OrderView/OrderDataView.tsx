import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import {
  CheckIcon,
  CopyIcon,
  EnvelopeSimpleIcon,
  FloppyDiskIcon,
  MapPinIcon,
  PhoneIcon,
  TruckIcon,
  StorefrontIcon,
  UserIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { ESelfPickupStatus, EShippingStatus, IOrder } from 'Hooks/Merchandise/orderTypes';
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
import { Separator } from '@/Components/ui/separator';
import { Spinner } from '@/Components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { cn } from '@/lib/utils';

const humanize = (value: string) => {
  const text = value.replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const shippingSteps: { value: EShippingStatus; description: string }[] = [
  { value: EShippingStatus.not_shipped, description: 'Order received and not shipped yet.' },
  {
    value: EShippingStatus.processing,
    description:
      'Being prepared. Set this once the merch team has acknowledged the order. The user is not notified.',
  },
  {
    value: EShippingStatus.shipping,
    description: 'Shipped. The user gets a notification, so add the tracking ID.',
  },
  { value: EShippingStatus.delivered, description: 'Delivered. No further action is needed.' },
];

const pickupSteps: { value: ESelfPickupStatus; description: string }[] = [
  {
    value: ESelfPickupStatus.not_ready_for_pickup,
    description: 'There is not enough stock yet, or the order is simply not ready.',
  },
  {
    value: ESelfPickupStatus.ready_for_pickup,
    description:
      'Ready for the customer to collect. Pre-orders are set automatically when enough stock arrives; other orders are set manually.',
  },
  { value: ESelfPickupStatus.picked_up, description: 'Collected. No further action is needed.' },
];

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label={`Copy ${label}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          toast.success(`${label} copied`);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          toast.error('Could not copy');
        }
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  );
}

function StatusBadge({ value, tone }: { value: string; tone: 'good' | 'bad' | 'neutral' }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        tone === 'good' && 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
        tone === 'bad' && 'bg-destructive/10 text-destructive',
      )}
    >
      {humanize(value)}
    </Badge>
  );
}

function Stepper<T extends string>({
  steps,
  current,
}: {
  steps: { value: T; description: string }[];
  current: T;
}) {
  const currentIndex = steps.findIndex((s) => s.value === current);
  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        return (
          <li key={step.value} className="relative flex gap-3 pb-5 last:pb-0">
            {index < steps.length - 1 && (
              <span
                className={cn(
                  'absolute top-6 left-[11px] h-[calc(100%-1.25rem)] w-px',
                  done ? 'bg-primary' : 'bg-border',
                )}
              />
            )}
            <span
              className={cn(
                'relative z-[1] mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                done && 'border-primary bg-primary text-primary-foreground',
                active && 'border-primary bg-primary/10 text-primary ring-4 ring-primary/15',
                !done && !active && 'bg-background text-muted-foreground',
              )}
            >
              {done ? <CheckIcon className="size-3.5" weight="bold" /> : index + 1}
            </span>
            <div className="min-w-0">
              <div
                className={cn('text-sm font-medium', !done && !active && 'text-muted-foreground')}
              >
                {humanize(step.value)}
              </div>
              {active && <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function InfoRow({
  icon,
  children,
  copy,
  copyLabel,
}: {
  icon: ReactNode;
  children: ReactNode;
  copy?: string;
  copyLabel?: string;
}) {
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <span className="mt-0.5 text-muted-foreground [&_svg]:size-4">{icon}</span>
      <div className="min-w-0 flex-1 break-words">{children}</div>
      {copy && <CopyButton text={copy} label={copyLabel ?? 'Value'} />}
    </div>
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
  const [newSelfPickupStatus, setNewSelfPickupStatus] = useState<ESelfPickupStatus>(
    order.selfpickupStatus,
  );
  const [selfPickupDialogOpen, setSelfPickupDialogOpen] = useState(false);

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
  const orderOk = order.orderStatus === 'order_confirmed';
  const paymentOk = order.paymentStatus === 'payment_received';

  return (
    <div className="grid gap-6">
      {/* Summary */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-semibold break-all">{order.orderId}</span>
              <CopyButton text={order.orderId} label="Order ID" />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{dateStr}</span>
              <span>·</span>
              <Badge variant="outline" className="gap-1">
                {order.isSelfPickup ? <StorefrontIcon /> : <TruckIcon />}
                {order.isSelfPickup ? 'Self pickup' : 'Delivery'}
              </Badge>
              <StatusBadge value={order.orderStatus} tone={orderOk ? 'good' : 'bad'} />
              <StatusBadge value={order.paymentStatus} tone={paymentOk ? 'good' : 'bad'} />
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs tracking-wide text-muted-foreground uppercase">Total paid</div>
            <div className="text-2xl font-bold tabular-nums">₹{order.totalAmountInRs}</div>
          </div>
        </CardContent>
      </Card>

      {!orderOk && (
        <Alert variant="destructive">
          <WarningCircleIcon />
          <AlertDescription>
            This order is {humanize(order.orderStatus).toLowerCase()}, so its status can't be
            updated.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Main column */}
        <div className="grid content-start gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                Items{' '}
                <span className="font-normal text-muted-foreground">
                  ({order.orderItems.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.orderItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="font-medium">{item.item.name}</div>
                          <div className="mt-1 flex gap-1">
                            <Badge variant="outline">{item.sizeOption}</Badge>
                            <Badge variant="outline">{item.colorOption}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                        <TableCell className="text-right tabular-nums">₹{item.price}</TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          ₹{item.price * item.quantity}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <dl className="ml-auto grid w-full max-w-xs gap-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="tabular-nums">₹{actualOrderPrice}</dd>
                </div>
                {order.additionalCharges.map((charge, index) => (
                  <div key={index} className="flex justify-between">
                    <dt className="text-muted-foreground">{humanize(charge.chargeType)}</dt>
                    <dd className="tabular-nums">₹{charge.chargeAmountInRs}</dd>
                  </div>
                ))}
                <Separator className="my-1" />
                <div className="flex justify-between font-semibold">
                  <dt>Total paid by user</dt>
                  <dd className="tabular-nums">₹{order.totalAmountInRs}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Side column */}
        <div className="grid content-start gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{order.isSelfPickup ? 'Pickup' : 'Shipping'}</CardTitle>
              <Button
                size="sm"
                disabled={!canUpdateStatus}
                onClick={() =>
                  order.isSelfPickup ? setSelfPickupDialogOpen(true) : setShippingDialogOpen(true)
                }
              >
                Update status
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4">
              {order.isSelfPickup ? (
                <Stepper steps={pickupSteps} current={order.selfpickupStatus} />
              ) : (
                <>
                  <Stepper steps={shippingSteps} current={order.shippingStatus} />
                  <Separator />
                  <div className="space-y-1">
                    <div className="text-xs tracking-wide text-muted-foreground uppercase">
                      Tracking ID
                    </div>
                    {order.trackingId ? (
                      <div className="flex items-center gap-1 font-mono text-sm break-all">
                        {order.trackingId}
                        <CopyButton text={order.trackingId} label="Tracking ID" />
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No tracking ID provided</p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <InfoRow icon={<UserIcon />}>
                <span className="font-medium">{order.user?.name}</span>
              </InfoRow>
              {order.user?.email && (
                <InfoRow icon={<EnvelopeSimpleIcon />} copy={order.user.email} copyLabel="Email">
                  <a href={`mailto:${order.user.email}`} className="hover:underline">
                    {order.user.email}
                  </a>
                </InfoRow>
              )}
              {order.user?.phoneNumber && (
                <InfoRow icon={<PhoneIcon />} copy={order.user.phoneNumber} copyLabel="Phone">
                  <a href={`tel:${order.user.phoneNumber}`} className="hover:underline">
                    {order.user.phoneNumber}
                  </a>
                </InfoRow>
              )}
              {!order.isSelfPickup && order.address && (
                <>
                  <Separator />
                  <InfoRow icon={<MapPinIcon />} copy={order.address} copyLabel="Address">
                    {order.address.split('\n').map((line, index) => (
                      <div key={index}>{line}</div>
                    ))}
                  </InfoRow>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge value={order.paymentStatus} tone={paymentOk ? 'good' : 'bad'} />
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Razorpay order ID</span>
                <div className="flex items-center gap-1 font-mono text-xs break-all">
                  {order.razOrderId}
                  <CopyButton text={order.razOrderId} label="Razorpay order ID" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
                  {shippingSteps.map((step) => (
                    <SelectItem key={step.value} value={step.value}>
                      {humanize(step.value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {shippingSteps.find((s) => s.value === newShippingStatus)?.description}
              </p>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="trackingId">Tracking ID</Label>
              <Input
                id="trackingId"
                disabled={updatingShippingStatus}
                value={newTrackingId ?? ''}
                onChange={(e) => setNewTrackingId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">This will be shown to the user.</p>
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
                {pickupSteps.map((step) => (
                  <SelectItem key={step.value} value={step.value}>
                    {humanize(step.value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {pickupSteps.find((s) => s.value === newSelfPickupStatus)?.description}
            </p>
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
    </div>
  );
}
