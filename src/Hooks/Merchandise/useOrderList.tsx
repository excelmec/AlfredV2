import { useContext, useState } from 'react';
import { ApiContext } from 'Contexts/Api/ApiContext';
import { getErrMsg } from 'Hooks/errorParser';
import { TypeSafeColDef } from 'Hooks/gridColumType';
import { IOrder } from './orderTypes';
import { GridRenderCellParams } from '@mui/x-data-grid';

export function useOrderList() {
	const [orderList, setOrderList] = useState<IOrder[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string>('');

	const { axiosMerchPrivate } = useContext(ApiContext);

	async function fetchOrderList() {
		try {
			setLoading(true);
			setError('');

			const response = await axiosMerchPrivate.get<{
				message: string;
				orders: IOrder[];
			}>('/admin/orders');

			setOrderList(response.data.orders);
		} catch (error) {
			setError(getErrMsg(error));
		} finally {
			setLoading(false);
		}
	}

	const columns: TypeSafeColDef<IOrder>[] = [
		{
			field: 'orderId',
			headerName: 'OrderId',
			type: 'string',
			align: 'center',
			headerAlign: 'center',
			width: 200,
			renderCell: ({ row }: GridRenderCellParams<IOrder>) => {
				return (
					<span
						style={{
							whiteSpace: 'normal',
							wordWrap: 'break-word',
							fontSize: '0.7rem',
						}}
					>
						{row.orderId}
					</span>
				);
			},
		},
		{
			field: 'orderDate',
			headerName: 'Order Placed at',
			type: 'string',
			width: 170,
			valueGetter: (params: GridRenderCellParams<IOrder>) => {
				let dateVal: Date = typeof params.value.getMonth === 'function' ? params.value : new Date(params.value);
				return dateVal.toLocaleString('en-IN', {
					year: '2-digit',
					month: 'short',
					day: 'numeric',
					hour: 'numeric',
					minute: 'numeric',
					hour12: true,
				});
			}
		},
		{
			field: 'user.name',
			headerName: 'User Name',
			type: 'string',
			width: 150,
			valueGetter: (params: GridRenderCellParams<IOrder>) =>
				params.row?.user?.name,
		},
		{
			field: 'trackingId',
			headerName: 'Tracking ID',
			type: 'string',
			width: 150,
			align: 'center',
		},
		{
			field: 'orderStatus',
			headerName: 'Order Status',
			width: 150,
			align: 'center',
		},
		{
			field: 'paymentStatus',
			headerName: 'Payment Status',
			width: 150,
			align: 'center',
		},
		{
			field: 'shippingStatus',
			headerName: 'Shipping Status',
			width: 150,
			align: 'center',
		},

		{
			field: 'totalAmountInRs',
			headerName: 'Total Amt.',
			type: 'number',
			width: 80,
			align: 'center',
		},
		{
			field: 'itemCount',
			headerName: 'Item Count',
			type: 'number',
			width: 100,
			align: 'center',
			valueGetter: (params: GridRenderCellParams<IOrder>) =>
				params.row?.orderItems?.length,
		},
	];

	return {
		orderList,
		loading,
		error,
		fetchOrderList,
		columns,
	} as const;
}
