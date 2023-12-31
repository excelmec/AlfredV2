import { Box, Typography } from '@mui/material';
import ItemEditable from 'Components/Merchandise/ItemCreateEdit/Editable/ItemEditable';
import MerchEditToolbar from 'Components/Merchandise/ItemCreateEdit/Toolbar/MerchEditToolbar';
import { useItemCreate } from 'Hooks/Merchandise/create-update/useItemCreate';

export default function MerchItemCreatePage() {
	const {
		item: modifiedItem,
		setItem: setModifiedItem,
		createItem,
		loading: savingItem,
		validationErrors,
		error,
		validateEvent,
	} = useItemCreate();

	if (error) {
		return <Typography variant='h5'>{error}</Typography>;
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
						Create New Item
					</Typography>
				</Box>
				<br />

				<MerchEditToolbar
					itemId={undefined}
					saveChanges={createItem}
					hasUnsavedChanges={false}
					savingChanges={savingItem}
				/>

				<ItemEditable
					validationErrors={validationErrors}
					item={modifiedItem}
					setItem={setModifiedItem}
					validateEvent={validateEvent}
				/>
			</>
		</>
	);
}
