import { Box, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useItemView } from '../../../Hooks/Merchandise/useItemView';
import { useParams } from 'react-router-dom';
import ItemDetails from 'Components/Merchandise/ItemViewDetails/ItemViewDetails';
import ItemViewToolBar from 'Components/Merchandise/ItemViewDetails/ToolBar/ItemViewToolBar';

export default function MerchItemViewPage() {
	const { item, fetchItem, loading, error } = useItemView();

	const { itemId: itemIdStr } = useParams();
	const itemId = parseInt(itemIdStr ?? '');

	// const navigate = useNavigate();

	useEffect(() => {
		fetchItem(itemId);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [itemId]);

	if (error) {
		return <Typography variant='h5'>{error}</Typography>;
	}

	if (loading) {
		return <Typography variant='h5'>Loading...</Typography>;
	}

	if (!item) {
		return <Typography variant='h5'>Item not found</Typography>;
	}

	return (
		<>
			<>
				<br />
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						width: '100%',
					}}
				>
					<Typography variant='h5' noWrap>
						Item Description
					</Typography>
				</Box>
				<br />

				<ItemViewToolBar itemId={itemId} />

				<ItemDetails item={item} key={itemId} />
			</>
		</>
	);
}
