import {
	DataGrid,
	GridColumnVisibilityModel,
	GridToolbar,
} from '@mui/x-data-grid';
import { IRegistration } from 'Hooks/Event/registrationTypes';
import { TypeSafeColDef } from 'Hooks/gridColumType';

import './EventRegIndividual.css';

export default function EventRegIndividual({
	individualRegsLoading,
	eventRegsIndividual,
	regIndividualCols,
	isTeam,
}: {
	individualRegsLoading: boolean;
	eventRegsIndividual: IRegistration[];
	regIndividualCols: TypeSafeColDef<IRegistration>[];
	isTeam: boolean;
}) {
	const initialColVisibility: GridColumnVisibilityModel = {
		'user.category': false,
		'ambassadorId': false,
		'teamId': isTeam,
		'team.name': isTeam,
	};

	return (
		<DataGrid
			density='compact'
			getRowId={getRowId}
			rows={eventRegsIndividual}
			columns={regIndividualCols}
			loading={individualRegsLoading}
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
					columnVisibilityModel: initialColVisibility,
				},
			}}
		/>
	);
}

function getRowId(row: IRegistration) {
	return row.excelId?.toString();
}
