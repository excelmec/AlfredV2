import { Typography } from '@mui/material';
import {
	DataGrid,
	GridActionsCellItem,
	GridRowParams,
	GridToolbar,
} from '@mui/x-data-grid';
import { useEffect } from 'react';
import { TypeSafeColDef } from 'Hooks/gridColumType';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import { IEventWithStats } from 'Hooks/Event/eventStatsTypes';
import { useEventStatistics } from 'Hooks/Event/statistics/useEventStatistics';

function getRowId(row: IEventWithStats) {
	return row.id;
}

export default function EventStatsPage() {
	const {
		eventStatsArray,
		fetchEventStatistics,
		loading,
		error,
		eventStatsCols,
	} = useEventStatistics();

	// const [showEventsNotNeedingReg, setShowEventsNotNeedingReg] =
	// 	useState(false);

	const navigate = useNavigate();

	const muiColumns: TypeSafeColDef<IEventWithStats>[] = [
		{
			field: 'actions',
			headerName: 'Actions',
			type: 'actions',
			width: 150,
			getActions: (params: GridRowParams<IEventWithStats>) => [
				<GridActionsCellItem
					icon={<VisibilityIcon color='primary' />}
					label='View'
					onClick={() => {
						navigate(`/events/registrations/view/${params.row.id}`);
					}}
				/>,
			],
		},
		...eventStatsCols,
	];

	useEffect(() => {
		fetchEventStatistics();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (error) {
		return <Typography variant='h5'>{error}</Typography>;
	}

	// function CustomToolbar() {
	// 	return (
	// 		<>
	// 			<GridToolbarContainer>
	// 				<GridToolbar showQuickFilter />
	// 			</GridToolbarContainer>
	// 			<div
	// 				style={{
	// 					display: 'flex',
	// 					justifyContent: 'flex-start',
	// 					fontSize: '0.8rem !important',
	// 					padding: '0.2rem 1rem',
	// 				}}
	// 			>
	// 				<FormControlLabel
	// 					control={
	// 						<Checkbox
	// 							checked={showEventsNotNeedingReg}
	// 							size='small'
	// 							onChange={() => {
	// 								setShowEventsNotNeedingReg(
	// 									!showEventsNotNeedingReg
	// 								);
	// 							}}
	// 						/>
	// 					}
	// 					label='Show events not needing registration'
	// 				/>
	// 			</div>
	// 		</>
	// 	);
	// }

	// This needed further clarification so disabled for now
	const filteredEventStatsArray = eventStatsArray.filter((event) => {
		return true;

		// if (showEventsNotNeedingReg) {
		// 	return true;
		// }
		// return event.needRegistration === true;
	});

	return (
		<>
			<br />
			<Typography variant='h5' noWrap component='div'>
				Event Registration Statistics
			</Typography>
			<br />
			<DataGrid
				density='compact'
				getRowId={getRowId}
				rows={filteredEventStatsArray}
				columns={muiColumns}
				loading={loading}
				sx={{
					width: '90%',
				}}
				autoPageSize
				slots={{ toolbar: GridToolbar }}
				slotProps={{
					toolbar: {
						showQuickFilter: true,
					},
				}}
			/>
		</>
	);
}
