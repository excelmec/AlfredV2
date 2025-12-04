import { ESize, IItem } from './itemTypes';

export interface IMerchUser {
  id: number;
  name: string;
  email: string;

  phoneNumber?: string;
  address?: IMerchUserAddress;

  // orders    Order[]
  // cartItems CartItem[]
}

export interface IMerchUserAddress {
  id: number;
  userId: Pick<IMerchUser, 'id'>;
  city: string;
  house: string;
  area: string;
  zipcode: string;
  state: string;
}

export interface IOrder {
  orderId: string;
  userId: Pick<IMerchUser, 'id'>;
  user: IMerchUser;
  address: string;
  razOrderId: string;
  orderDate: Date;
  trackingId?: string;
  isSelfPickup: boolean;

  orderStatus: EOrderStatus;
  paymentStatus: EPaymentStatus;
  shippingStatus: EShippingStatus;
  selfpickupStatus: ESelfPickupStatus;

  totalAmountInRs: number;
  additionalCharges: IAdditionalOrderCharges[];

  orderItems: IOrderItem[];
}

export interface IOrderItem {
  id: number;

  sizeOption: ESize;
  colorOption: string;
  quantity: number;
  price: number;

  orderId: Pick<IOrder, 'orderId'>;
  order: IOrder;
  itemId: Pick<IItem, 'id'>;
  item: IItem;
}

export enum EOrderStatus {
  pre_ordered = 'pre_ordered',
  order_unconfirmed = 'order_unconfirmed',
  order_confirmed = 'order_confirmed',
  order_cancelled_by_user = 'order_cancelled_by_user',
  order_cancelled_insufficient_stock = 'order_cancelled_insufficient_stock',
}

export enum EPaymentStatus {
  payment_pending = 'payment_pending',
  payment_received = 'payment_received',

  payment_refund_initiated = 'payment_refund_initiated',
  payment_refund_failed = 'payment_refund_failed',
  payment_refunded = 'payment_refunded',
}

export enum EShippingStatus {
  not_shipped = 'not_shipped',
  processing = 'processing',
  shipping = 'shipping',
  delivered = 'delivered',
}

export enum ESelfPickupStatus {
  not_ready_for_pickup = 'not_ready_for_pickup',
  ready_for_pickup = 'ready_for_pickup',
  picked_up = 'picked_up',
}

export interface IAdditionalOrderCharges {
  id: number;
  orderId: Pick<IOrder, 'orderId'>;
  order: IOrder;
  chargeType: string;
  chargeAmountInRs: number;
}
