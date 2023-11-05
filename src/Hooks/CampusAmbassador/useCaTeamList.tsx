import { useContext, useState } from 'react';
import { ApiContext } from 'Contexts/Api/ApiContext';
import { getErrMsg } from 'Hooks/errorParser';
import { CA } from './useCaList';
import { TypeSafeColDef } from 'Hooks/gridColumType';
import { GridValueGetterParams } from '@mui/x-data-grid';

export interface CaTeam {
	id: number;
	name: string;
	totalBonusPoints: number;
	totalRefPoints: number;
	ambassadors: CA[];
}

export function useCaTeamList() {
	const [caTeamList, setCaTeamList] = useState<CaTeam[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string>('');

	const { axiosEventsPrivate } = useContext(ApiContext);
	async function fetchCaTeamList() {
		try {
			setLoading(true);
			setError('');
			const response = await axiosEventsPrivate.get<CaTeam[]>(
				'/api/cateams/list'
			);

			setCaTeamList(response.data);
		} catch (error) {
			setError(getErrMsg(error));
		} finally {
			setLoading(false);
		}
	}

	const columns: TypeSafeColDef<CaTeam>[] = [
		{
			field: 'id',
			headerName: 'Team ID',
			type: 'number',
			align: 'center',
			headerAlign: 'center',
		},
		{
			field: 'name',
			headerName: 'Name',
			type: 'string',
		},
		{
			field: 'totalBonusPoints',
			headerName: 'Total Bonus Points',
			type: 'number',
			align: 'center',
			headerAlign: 'center',
		},
		{
			field: 'totalRefPoints',
			headerName: 'Total Referal Points',
			type: 'number',
			align: 'center',
			headerAlign: 'center',
		},
		{
			field: 'ambassadors',
			headerName: 'Ambassadors',
			type: 'string',
			valueGetter: (params: GridValueGetterParams<CaTeam>) => {
				return params.row.ambassadors?.map((ambassador)=>{
					return ambassador?.name
				}).join(', ');
			},
		},
	];

	return { caTeamList, loading, error, fetchCaTeamList, columns } as const;
}
