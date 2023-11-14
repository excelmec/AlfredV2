import { Box, Typography } from '@mui/material';
import CaDataView from 'Components/CampusAmbassador/CaData';
import { useCa } from 'Hooks/CampusAmbassador/useCa';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function CaViewPage() {
	const { ambassadorId } = useParams();
	const {
		ca,
		caPointLog,
		fetchCa,
		loading,
		error,

		addNewPoint,
		savingNewPoint,

		deletePoint,
		deletingPoint
	} = useCa();

	useEffect(() => {
		fetchCa(Number(ambassadorId));

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ambassadorId]);

	if (loading) {
		return (
			<Typography variant='h5' noWrap component='div'>
				Loading...
			</Typography>
		);
	}

	if (error) {
		return (
			<Typography variant='h5' noWrap component='div'>
				{error}
			</Typography>
		);
	}

	return (
		<>
			<Box>
				<Typography variant='h5' noWrap component='div'>
					Campus Ambassador View
				</Typography>
			</Box>
			<br />

			<CaDataView
				ca={ca}
				caPointLog={caPointLog}
				addNewPoint={addNewPoint}
				savingNewPoint={savingNewPoint}
				deletePoint={deletePoint}
				deletingPoint={deletingPoint}
			/>
		</>
	);
}
