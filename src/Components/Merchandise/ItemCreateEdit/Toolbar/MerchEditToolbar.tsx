import { Box, Button, Paper } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import './MerchEditToolbar.css';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { TupdateFnReturn } from 'Hooks/errorParser';

type SaveChangesWithParam = {
	itemId: number;
	saveChanges(itemId: number): Promise<TupdateFnReturn>;
	hasUnsavedChanges: boolean;
	savingChanges: boolean;
};

type SaveChangesWithoutParam = {
	itemId: undefined;
	saveChanges: () => Promise<TupdateFnReturn>;
	hasUnsavedChanges: boolean;
	savingChanges: boolean;
};

type TProps = SaveChangesWithParam | SaveChangesWithoutParam;

export default function MerchEditToolbar({
	itemId,
	saveChanges,
	hasUnsavedChanges,
	savingChanges,
}: TProps) {
	const navigate = useNavigate();

	async function showUnsavedChangesPopup() {
		return window.confirm('You have unsaved changes. Do you want to exit?');
	}

	const handler = (event: BeforeUnloadEvent) => {
		event.preventDefault();
		event.returnValue = '';
	};

	async function saveItem() {
		try {
			let res;
			if (itemId !== undefined) {
				res = await saveChanges(itemId);
			} else {
				res = await saveChanges();
			}

			if (res.success) {
				toast.success('Item Saved.');
				navigate(`/merch/items/view/${res.id}`, {
					replace: true,
				});
				return;
			}

			if (res.validationError) {
				toast.error('Please fix the errors to continue.');

				const firstErrorName = res.validationError[0]?.path;
				if (!firstErrorName) return;

				const firstErrorElem =
					document.getElementsByName(firstErrorName)[0];

				if (!firstErrorElem) return;

				firstErrorElem.scrollIntoView({
					behavior: 'smooth',
					block: 'start',
				});

				return;
			}
		} catch (error: any) {
			console.log(error);
			toast.error(`Error saving item: ${error?.message}`);
		}
	}

	useEffect(() => {
		if (hasUnsavedChanges) {
			window.addEventListener('beforeunload', handler);
		} else {
			window.removeEventListener('beforeunload', handler);
		}

		return () => {
			window.removeEventListener('beforeunload', handler);
		};
	}, [hasUnsavedChanges]);

	return (
		<Box
			className='item-edit-toolbar'
			component={Paper}
			elevation={2}
			borderRadius={0}
			zIndex={5}
		>
			<Box sx={{ flexGrow: 1 }} />

			<Button
				variant='contained'
				color='secondary'
				startIcon={<SaveIcon />}
				className='toolbutton'
				onClick={saveItem}
				disabled={savingChanges}
			>
				{savingChanges ? 'Saving...' : 'Save'}
			</Button>
			<Button
				variant='contained'
				color='error'
				startIcon={<CancelIcon />}
				className='toolbutton'
				disabled={savingChanges}
				onClick={async () => {
					if (hasUnsavedChanges) {
						const confirmExit = await showUnsavedChangesPopup();
						console.log(confirmExit);
						if (!confirmExit) return;
					}

					console.log('navigating');
					navigate(-1);
				}}
			>
				Cancel
			</Button>
		</Box>
	);
}
