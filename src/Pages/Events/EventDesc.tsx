import { Box, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useEventDesc } from '../../Hooks/Event/useEventDesc';
import { useParams } from 'react-router-dom';
import ToolBar from '../../Components/EventDesc/ToolBar/ToolBar';
import EventData from '../../Components/EventDesc/EventData/EventData';

export default function EventDescPage() {
	const { event, fetchEvent, loading, error, setError } = useEventDesc();

	const { id } = useParams<{ id: string }>();

	useEffect(() => {
		if (!Number.isInteger(Number(id))) {
			setError('Invalid Event ID');
		}

		fetchEvent(Number(id));

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (error) {
		return <Typography variant='h5'>{error}</Typography>;
	}

	if (loading) {
		return <Typography variant='h5'>Loading...</Typography>;
	}

	return (
		<>
			<br />
			<Box sx={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				width: '100%',
			}}>
				<Typography variant='h5' noWrap>
					Event Description
				</Typography>
			</Box>
			<br />

			<ToolBar />
			<EventData event={event!} />
		</>
	);
}
