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
	Input,
	Select,
	OutlinedInput,
	Chip,
	MenuItem,
	IconButton,
	TextField,
} from '@mui/material';

import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

import './ItemEditable.css';

import { ReactElement, useState } from 'react';
import { IItemEditWithFile } from 'Hooks/Merchandise/itemEditTypes';
import { sizeOptions } from 'Hooks/Merchandise/itemTypes';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
			width: 250,
		},
	},
};

export default function ItemEditable({
	itemId,
	item,
	setItem,
	imagesLoading,
}: {
	itemId: number;
	item: IItemEditWithFile;
	setItem: React.Dispatch<React.SetStateAction<IItemEditWithFile>>;
	imagesLoading: boolean;
}) {
	const [newColorOption, setNewColorOption] = useState<string>('');

	function StockRow({ color }: { color: string }) {
		const tableCells: ReactElement[] = [];

		item.sizeOptions.forEach((size) => {
			const stock = item.stockCount.find(
				(stock) =>
					stock.colorOption === color && stock.sizeOption === size
			);

			if (!stock) {
				item.stockCount.push({
					colorOption: color,
					sizeOption: size,
					count: 0,
				});
			}

			tableCells.push(
				<TableCell align='center'>
					<TextField
						variant='outlined'
						fullWidth
						value={
							item.stockCount.find(
								(stock) =>
									stock.colorOption === color &&
									stock.sizeOption === size
							)?.count ?? 0
						}
						onChange={(e) => {
							const {
								target: { value },
							} = e;

							setItem({
								...item,
								stockCount: item.stockCount.map((stock) => {
									if (
										stock.colorOption === color &&
										stock.sizeOption === size
									) {
										return {
											...stock,
											count: parseInt(value),
										};
									} else {
										return stock;
									}
								}),
							});
						}}
						placeholder='Stock Count'
						type='number'
					/>
				</TableCell>
			);
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

	function SelectOptions({
		itemField,
		label,
		options,
	}: {
		itemField: 'sizeOptions';
		label: string;
		options: IItemEditWithFile[typeof itemField];
	}) {
		return (
			<Select
				fullWidth
				multiple
				value={item[itemField]}
				onChange={(event) => {
					const {
						target: { value },
					} = event;

					if (!Array.isArray(value)) {
						/**
						 * This happens on AutoFill
						 */
						return;
					}

					setItem({
						...item,
						[itemField]: value,

						stockCount: item.stockCount.filter((stock) =>
							value.includes(stock.sizeOption)
						),
					});
				}}
				input={<OutlinedInput label={label} />}
				renderValue={(selected) => (
					<Box
						sx={{
							display: 'flex',
							flexWrap: 'wrap',
							gap: 0.5,
						}}
					>
						{selected.map((value) => (
							<Chip key={value} label={value} />
						))}
					</Box>
				)}
				MenuProps={MenuProps}
			>
				{options.map((size) => (
					<MenuItem key={size} value={size}>
						{size}
					</MenuItem>
				))}
			</Select>
		);
	}

	return (
		<Box
			className='item-editable-data-container'
			component={Paper}
			elevation={1}
			borderRadius={0}
		>
			<Grid
				container
				spacing={2}
				justifyContent='center'
				alignItems='center'
				className='item-editable-data-grid'
			>
				<Grid item xs={12}>
					<Typography variant='h5'>Item Basic Details</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>ID</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{itemId}</Typography>
				</Grid>

				<Grid item xs={6}>
					<Typography>Name</Typography>
				</Grid>
				<Grid item xs={6}>
					<TextField
						variant='outlined'
						fullWidth
						value={item.name}
						onChange={(e) =>
							setItem({ ...item, name: e.target.value })
						}
						placeholder='Name'
					/>
				</Grid>

				<Grid item xs={6}>
					<Typography>Description</Typography>
				</Grid>
				<Grid item xs={6}>
					<TextField
						variant='outlined'
						fullWidth
						value={item.description}
						onChange={(e) =>
							setItem({ ...item, description: e.target.value })
						}
						placeholder='Description'
						multiline
					/>
				</Grid>

				<Grid item xs={6}>
					<Typography>Price</Typography>
				</Grid>
				<Grid item xs={6}>
					<TextField
						variant='outlined'
						fullWidth
						value={item.price}
						onChange={(e) =>
							setItem({
								...item,
								price: parseInt(e.target.value),
							})
						}
						placeholder='Price'
						multiline
						type='number'
					/>
				</Grid>

				<Grid item xs={6}>
					<Typography>Size Options</Typography>
				</Grid>
				<Grid item xs={6}>
					<SelectOptions
						itemField='sizeOptions'
						label='Size Options'
						options={sizeOptions}
					/>
				</Grid>

				<Grid item xs={6}>
					<Typography>Color Options</Typography>
				</Grid>
				<Grid item xs={6} container rowGap={2}>
					<Grid item xs={12}>
						<Box>
							{item.colorOptions.length === 0 ? (
								<Typography color='error'>
									No Color Options Created
								</Typography>
							) : (
								item.colorOptions.map((color) => (
									<Box
										sx={{
											display: 'inline-block',
											m: 0.5,
										}}
									>
										<Chip
											key={color}
											label={color}
											variant='outlined'
											onDelete={(e) => {
												setItem({
													...item,
													colorOptions:
														item.colorOptions.filter(
															(itemColor) =>
																itemColor !==
																color
														),

													stockCount:
														item.stockCount.filter(
															(stock) =>
																stock.colorOption !==
																color
														),
												});
											}}
										/>
									</Box>
								))
							)}
						</Box>
					</Grid>
					{/* <Grid item xs={6}>
						<Typography>Add Color Option</Typography>
					</Grid> */}
					<Grid item xs={7}>
						<Input
							fullWidth
							value={newColorOption}
							onChange={(e) => setNewColorOption(e.target.value)}
							placeholder='Add new Color Option'
							onKeyUp={(e) => {
								if (e.key === 'Enter') {
									if (newColorOption === '') {
										return;
									}

									setItem({
										...item,
										colorOptions: [
											...item.colorOptions,
											newColorOption,
										],
									});
									setNewColorOption('');
								}
							}}
						/>
					</Grid>

					<Grid item xs={5}>
						<Box>
							<IconButton
								sx={{
									display:
										newColorOption === '' ? 'none' : '',
								}}
								onClick={() => {
									if (newColorOption === '') {
										return;
									}
									setItem({
										...item,
										colorOptions: [
											...item.colorOptions,
											newColorOption,
										],
									});
									setNewColorOption('');
								}}
							>
								<CheckIcon />
							</IconButton>
							<IconButton
								onClick={() => setNewColorOption('')}
								sx={{
									display:
										newColorOption === '' ? 'none' : '',
								}}
							>
								<ClearIcon />
							</IconButton>
						</Box>
					</Grid>
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
			</Grid>
		</Box>
	);
}
