import {
	Box,
	Button,
	Divider,
	Grid,
	Paper,
	Table,
	TableBody,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Select,
	MenuItem,
} from '@mui/material';

import { StyledTableCell } from 'Components/Commons/TableCell';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import './OrderDataView.css';

import { useState } from 'react';
import { EShippingStatus, IOrder } from 'Hooks/Merchandise/orderTypes';

export default function OrderDataView({
	order,
	updateOrderShippingStatus,
	updatingShippingStatus,
}: {
	order: IOrder;
	updateOrderShippingStatus: (
		orderId: string,
		shippingStatus: string,
		trackingId?: string
	) => void;
	updatingShippingStatus: boolean;
}) {
	const [newShippingStatus, setNewShippingStatus] = useState<EShippingStatus>(
		order.shippingStatus
	);
	const [newTrackingId, setNewTrackingId] = useState<string | undefined>(
		order.trackingId
	);
	const [shippingDialogOpen, setShippingDialogOpen] = useState(false);
	const [helpDialogOpen, setHelpDialogOpen] = useState(false);

	const handleShippingDialogClose = () => {
		if (updatingShippingStatus) {
			return;
		}
		setNewShippingStatus(order.shippingStatus);
		setNewTrackingId(order.trackingId);
		setShippingDialogOpen(false);
	};

	const dateVal: Date =
		typeof order.orderDate.getMonth === 'function'
			? order.orderDate
			: new Date(order.orderDate);
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
		0
	);
	const actualOrderPrice = order.totalAmountInRs - totalAdditionalCharge;

	return (
		<Box
			className='order-data-container'
			component={Paper}
			elevation={2}
			borderRadius={0}
		>
			<Grid
				container
				spacing={2}
				justifyContent='center'
				alignItems='center'
				className='order-data-grid'
			>
				<Grid item xs={12}>
					<Typography variant='h5'>Order Details</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>Order ID</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{order.orderId}</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>Order Date Time</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{dateStr}</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>Order Address</Typography>
				</Grid>
				<Grid item xs={6}>
					{order.address?.split('\n').map((line, index) => (
						<Typography key={index}>{line}</Typography>
					))}
				</Grid>
				<Grid item xs={6}>
					<Typography>Razorpay Order ID</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{order.razOrderId}</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>Actual Order Price</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{`${actualOrderPrice} Rs`}</Typography>
				</Grid>

				<Grid item xs={6}>
					<Typography>Additional Charges</Typography>
				</Grid>
				<Grid item xs={6}>
					{order.additionalCharges.length === 0 ? (
						<Typography>No Additional Charges</Typography>
					) : (
						<TableContainer component={Paper}>
							<Table>
								<TableHead>
									<TableRow>
										<StyledTableCell>
											Charge Name
										</StyledTableCell>
										<StyledTableCell>
											Charge Amount
										</StyledTableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{order.additionalCharges.map(
										(charge, index) => (
											<TableRow key={index}>
												<StyledTableCell>
													{charge.chargeType}
												</StyledTableCell>
												<StyledTableCell>
													{`${charge.chargeAmountInRs} Rs`}
												</StyledTableCell>
											</TableRow>
										)
									)}
								</TableBody>
							</Table>
						</TableContainer>
					)}
				</Grid>
				<Grid item xs={6}>
					<Typography>Total Amount paid by user</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{`${order.totalAmountInRs} Rs`}</Typography>
				</Grid>

				<Grid item xs={12}>
					<Divider />
				</Grid>
				<Grid item xs={12}>
					<Typography variant='h5'>Order Status Info</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>Delivery Tracking ID</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>
						{order.trackingId ?? '<NO TRACKING ID WAS PROVIDED>'}
					</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>Order Status</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography
						color={
							order.orderStatus !== 'order_confirmed'
								? 'error'
								: ''
						}
					>
						{order.orderStatus}
					</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>Payment Status</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography
						color={
							order.paymentStatus !== 'payment_received'
								? 'error'
								: ''
						}
					>
						{order.paymentStatus}
					</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>Shipping Status</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography
						color={
							order.shippingStatus === 'not_shipped' ||
							order.shippingStatus === 'processing'
								? 'error'
								: ''
						}
					>
						{order.shippingStatus}
					</Typography>
				</Grid>

				<Grid item xs={3}>
					<Button
						disabled={updatingShippingStatus || order.orderStatus !== 'order_confirmed'}
						size='small'
						variant='contained'
						color='primary'
						onClick={() => {
							setShippingDialogOpen(true);
						}}
					>
						Update Shipping Status
					</Button>
				</Grid>
				<Grid item xs={9}>
					<Button
						size='small'
						variant='contained'
						color='primary'
						onClick={() => {
							setHelpDialogOpen(!helpDialogOpen);
						}}
					>
						Open Help
					</Button>
				</Grid>

				<Grid item xs={12}>
					<Divider />
				</Grid>
				<Grid item xs={12}>
					<Typography variant='h5'>User Details</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>User Name</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{order.user?.name}</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>User Email</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{order.user?.email}</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>User Phone</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{order.user?.phoneNumber}</Typography>
				</Grid>

				<Grid item xs={12}>
					<Divider />
				</Grid>

				<Grid item xs={12}>
					<Typography variant='h5'>Order Items</Typography>
				</Grid>
				<Grid item xs={12}>
					<TableContainer component={Paper}>
						<Table>
							<TableHead>
								<TableRow>
									<StyledTableCell>Item Name</StyledTableCell>
									<StyledTableCell>Size</StyledTableCell>
									<StyledTableCell>Color</StyledTableCell>
									<StyledTableCell>Quantity</StyledTableCell>
									<StyledTableCell>
										Price of each item
									</StyledTableCell>
									<StyledTableCell>
										Total item price
									</StyledTableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{order.orderItems.map((item, index) => (
									<TableRow key={index}>
										<StyledTableCell>
											{item.item.name}
										</StyledTableCell>
										<StyledTableCell>
											{item.sizeOption}
										</StyledTableCell>
										<StyledTableCell>
											{item.colorOption}
										</StyledTableCell>
										<StyledTableCell>
											{item.quantity}
										</StyledTableCell>
										<StyledTableCell>
											{`${item.price} Rs`}
										</StyledTableCell>
										<StyledTableCell>
											{`${item.price * item.quantity} Rs`}
										</StyledTableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</Grid>
			</Grid>

			<Dialog
				open={shippingDialogOpen}
				onClose={handleShippingDialogClose}
				fullWidth
				maxWidth='sm'
			>
				<DialogTitle>Update Shipping Status</DialogTitle>
				<DialogContent>
					<Select
						value={newShippingStatus}
						onChange={(e) => {
							setNewShippingStatus(
								e.target.value as EShippingStatus
							);
						}}
						fullWidth
					>
						{Object.values(EShippingStatus).map((status) => (
							<MenuItem key={status} value={status}>
								{status}
							</MenuItem>
						))}
					</Select>
					<br />
					<br />
					<TextField
						id='trackingId'
						label='Tracking ID'
						type='text'
						fullWidth
						disabled={updatingShippingStatus}
						value={newTrackingId}
						onChange={(e) => {
							setNewTrackingId(e.target.value);
						}}
						helperText='Enter the tracking ID of the shipment. This will be shown to the user.'
					/>
					<br />
					<br />
					{newShippingStatus === 'shipping' &&
						order.shippingStatus !== 'shipping' && (
							<Typography
								color='error'
								variant='body2'
								align='center'
							>
								Warning: The user will get a notification
								stating that the order has been shipped.
							</Typography>
						)}
				</DialogContent>
				<DialogActions>
					<Button
						autoFocus
						onClick={() => {
							updateOrderShippingStatus(
								order.orderId,
								newShippingStatus,
								newTrackingId
							);
						}}
						disabled={updatingShippingStatus}
						startIcon={<SaveIcon />}
						variant='contained'
					>
						Save
					</Button>
					<Button
						onClick={handleShippingDialogClose}
						autoFocus
						disabled={updatingShippingStatus}
						startIcon={<CancelIcon />}
						variant='contained'
					>
						Cancel
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				open={helpDialogOpen}
				onClose={() => setHelpDialogOpen(false)}
				fullWidth
				maxWidth='sm'
			>
				<DialogTitle>Help</DialogTitle>
				<DialogContent>
					<Typography>
						<strong>Shipping Status</strong> - This is the status of
						the shipping. It can be one of the following:
					</Typography>
					<ul className='order-data-help-dialog'>
						<li>
							<strong>not_shipped</strong> - The order has not
							been shipped. This is the default status.
						</li>
						<li>
							<strong>processing</strong> - The order is being
							processed for shipping. Once the merch managing team
							has acknowledged the order, please set this status.
							No notification will be sent to the user.
						</li>
						<li>
							<strong>shipping</strong> - The order has been
							shipped. The user will get a notification stating
							that the order has been shipped. Please provide the
							tracking ID of the shipment.
						</li>
						<li>
							<strong>delivered</strong> - The order has been
							delivered. No further action is required.
						</li>
					</ul>
					<Typography>
						<strong>Tracking ID</strong> - This is the tracking ID
						of the shipment. This will be shown to the user.
					</Typography>
					<Typography>
						<strong>Status Flow:</strong> not_shipped -&gt;
						processing -&gt; shipping -&gt; delivered
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button
						autoFocus
						onClick={() => setHelpDialogOpen(false)}
						variant='contained'
					>
						Close
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
