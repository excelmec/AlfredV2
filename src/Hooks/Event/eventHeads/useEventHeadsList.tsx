import { useContext, useState } from 'react';
import { ApiContext } from 'Contexts/Api/ApiContext';
import { getErrMsg } from 'Hooks/errorParser';
import { TypeSafeColDef } from 'Hooks/gridColumType';
import { IEventHead } from '../eventTypes';

export function useEventHeadsList() {
	const [eventHeadsList, setEventHeadsList] = useState<IEventHead[]>(
		[]
	);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string>('');
	const { axiosEventsPrivate } = useContext(ApiContext);

	async function fetchEventHeadsList() {
		try {
			setLoading(true);
			setError('');

			const response = await axiosEventsPrivate.get<IEventHead[]>(
				'/api/eventhead'
			);

			setEventHeadsList(response.data);
		} catch (error) {
			setError(getErrMsg(error));
		} finally {
			setLoading(false);
		}
	}

	const columns: TypeSafeColDef<IEventHead>[] = [
		{
			field: 'id',
			headerName: 'ID',
			type: 'number',
			align: 'center',
			headerAlign: 'center',
			width: 10,
		},
		{
			field: 'name',
			headerName: 'Name',
			type: 'string',
			width: 250,
		},
		{
			field: 'email',
			headerName: 'Email',
			type: 'string',
			width: 250,
			align: 'center',
		},
		{
			field: 'phoneNumber',
			headerName: 'Phone Number',
			type: 'string',
			width: 150,
		},
	];

	return {
		setEventHeadsList,
		eventHeadsList,
		loading,
		error,
		fetchEventHeadsList,
		columns,
	} as const;
}
