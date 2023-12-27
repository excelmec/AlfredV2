import {
	Grid,
	Box,
	Typography,
	Paper,
	Divider,
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
} from '@mui/material';
import { IItem } from 'Hooks/Merchandise/itemTypes';

import './ItemViewDetails.css';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import { ReactElement } from 'react';

export default function ItemDetails({ item }: { item: IItem }) {
	// const stockByColor = lodash.groupBy(item.stockCount, 'colorOption');
	// console.log(stockByColor);

	// new Map<string, IStockCount[]>();
	// item.stockCount.forEach((stock) => {
	// 	const currentStock = stockByColor.get(stock.colorOption);

	// 	if (!currentStock) {
	// 		stockByColor.set(stock.colorOption, []);
	// 	} else {
	// 		currentStock.push(stock);
	// 		stockByColor.set(stock.colorOption, currentStock);
	// 	}
	// });

	function StockRow({ color }: { color: string }) {
		const tableCells: ReactElement[] = [];

		item.sizeOptions.forEach((size) => {
			const stock = item.stockCount.find(
				(stock) =>
					stock.colorOption === color && stock.sizeOption === size
			);

			if (stock) {
				tableCells.push(
					<TableCell align='center'>{stock.count}</TableCell>
				);
			} else {
				tableCells.push(<TableCell align='center'>NA</TableCell>);
			}
		});

		return (
			<TableRow>
				<TableCell
					align='center'
					sx={{
						fontWeight: 'bold',
						borderRight: '1px solid #0000001f',
					}}
				>
					{color}
				</TableCell>
				{tableCells}
			</TableRow>
		);
	}

	return (
		<Box
			className='item-data-container'
			component={Paper}
			elevation={1}
			borderRadius={0}
		>
			<Grid
				container
				spacing={2}
				justifyContent='center'
				alignItems='center'
				className='item-data-grid'
			>
				<Grid item xs={12}>
					<Typography variant='h5'>Item Basic Details</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>ID</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{item.id}</Typography>
				</Grid>

				<Grid item xs={6}>
					<Typography>Name</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{item.name}</Typography>
				</Grid>

				<Grid item xs={6}>
					<Typography>Description</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{item.description}</Typography>
				</Grid>

				<Grid item xs={6}>
					<Typography>Price</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{item.price}</Typography>
				</Grid>

				<Grid item xs={6}>
					<Typography>Size Options</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{item.sizeOptions.join(', ')}</Typography>
				</Grid>

				<Grid item xs={6}>
					<Typography>Color Options</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{item.colorOptions.join(', ')}</Typography>
				</Grid>

				<Grid item xs={12}>
					<Divider />
				</Grid>
				<Grid item xs={12}>
					<Typography variant='h5'>Stock Details</Typography>
				</Grid>

				<Grid item xs={12}>
					{item.stockCount.length !== 0 ? (
						<TableContainer component={Paper}>
							<Table sx={{ minWidth: 650 }}>
								<TableHead>
									<TableRow>
										<TableCell
											align='center'
											width={100}
											sx={{
												fontWeight: 'bold',
												borderRight:
													'1px solid #0000001f',
											}}
										>
											{}
										</TableCell>
										{item.sizeOptions.map((size) => (
											<TableCell
												align='center'
												sx={{
													fontWeight: 'bold',
												}}
												width={100}
											>
												{size}
											</TableCell>
										))}
									</TableRow>
								</TableHead>
								<TableBody>
									{item.colorOptions.map((color) => (
										<StockRow color={color} />
									))}
								</TableBody>
							</Table>
						</TableContainer>
					) : (
						<Typography>No Stock Data Available</Typography>
					)}
				</Grid>

				<Grid item xs={12}>
					<Divider />
				</Grid>
				<Grid item xs={12}>
					<Typography variant='h5'>Item Images</Typography>
				</Grid>

				<Grid item xs={6}>
					<Slider
						dots
						arrows
						centerMode={true}
						centerPadding='60px'
						infinite={false}
						speed={500}
						slidesToShow={item.mediaObjects.length > 2 ? 3 : 1}
						slidesToScroll={1}
						// nextArrow={
						// 	<button type="button">
						// 		<NavigateNextIcon />
						// 	</button>
						// }
					>
						{item.mediaObjects.map((mediaObject, index) => {
							return (
								<img
									src={mediaObject.url}
									referrerPolicy='no-referrer'
									alt={`Item ${index + 1}`}
									className='item-image'
								/>
							);
						})}
					</Slider>
				</Grid>
			</Grid>
		</Box>
	);
}
