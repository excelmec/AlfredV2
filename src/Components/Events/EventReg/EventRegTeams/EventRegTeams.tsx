import {
	DataGrid,
	GridActionsCellItem,
	GridRowParams,
	GridToolbar,
} from '@mui/x-data-grid';
import { ITeam } from 'Hooks/Event/registrationTypes';
import { TypeSafeColDef } from 'Hooks/gridColumType';
import VisibilityIcon from '@mui/icons-material/Visibility';

import './EventRegTeams.css';

export default function EventRegTeams({
	institutionMap,

	teamCols,
	eventRegsTeam,
	teamRegsLoading,
}: {
	institutionMap: Map<number, string>;
	teamCols: TypeSafeColDef<ITeam>[];
	eventRegsTeam: ITeam[];
	teamRegsLoading: boolean;
}) {
	const muiColumns = [
		{
			field: 'actions',
			headerName: 'Actions',
			type: 'actions',
			width: 70,
			getActions: (params: GridRowParams<ITeam>) => [
				<GridActionsCellItem
					icon={<VisibilityIcon color='primary' />}
					label='View'
					onClick={() => {}}
				/>,
			],
		},
		...teamCols,
	];

	return (
		<DataGrid
			density='compact'
			getRowId={getRowId}
			rows={eventRegsTeam}
			columns={muiColumns}
			loading={teamRegsLoading}
			autoPageSize
			slots={{ toolbar: GridToolbar }}
			slotProps={{
				toolbar: {
					showQuickFilter: true,
				},
			}}
			showCellVerticalBorder
			showColumnVerticalBorder
			initialState={{
				columns: {
					columnVisibilityModel: {
						ambassadorId: false,
					},
				},
			}}
		/>
	);
}

function getRowId(row: ITeam) {
	return row.id?.toString();
}
