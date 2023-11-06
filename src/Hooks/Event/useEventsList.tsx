import { useContext, useState } from 'react';
import { ApiContext } from 'Contexts/Api/ApiContext';
import { getErrMsg } from 'Hooks/errorParser';
import { IEventListItem } from './eventTypes';
import { GridActionsCellItem, GridRowParams } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { TypeSafeColDef } from 'Hooks/gridColumType';

export function useEventList() {
	const [eventList, setEventList] = useState<IEventListItem[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string>('');
	const navigate = useNavigate();

	const { axiosEventsPrivate } = useContext(ApiContext);

	async function fetchEventList() {
		try {
			setLoading(true);
			setError('');

			interface IEventListResponse
				extends Omit<IEventListItem, 'datetime'> {
				datetime: string;
			}

			const response = await axiosEventsPrivate.get<IEventListResponse[]>(
				'/api/events'
			);

			let eventListData: IEventListItem[] = response.data.map((event) => {
				return {
					...event,
					datetime: new Date(event.datetime),
				};
			});

			setEventList(eventListData);
		} catch (error) {
			setError(getErrMsg(error));
		} finally {
			setLoading(false);
		}
	}

	const columns: TypeSafeColDef<IEventListItem>[] = [
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
			width: 150,
		},
		{
			field: 'icon',
			headerName: 'Icon',
			type: 'string',
			width: 100,
			align: 'center',
			renderCell: (params) => {
				return (
					<img
						src={params.value}
						alt={'icon'}
						style={{
							maxWidth: '100%',
							maxHeight: '100%',
						}}
						referrerPolicy='no-referrer'
					/>
				);
			},
		},
		{
			field: 'eventType',
			headerName: 'Event Type',
			type: 'string',
			width: 100,
		},
		{
			field: 'category',
			headerName: 'Category',
			type: 'string',
			width: 100,
		},
		{
			field: 'venue',
			headerName: 'Venue',
			type: 'string',
			width: 130,
		},
		{
			field: 'needRegistration',
			headerName: 'Needs Registration',
			type: 'boolean',
			width: 100,
		},
		{
			field: 'day',
			headerName: 'Day',
			type: 'number',
			width: 10,
			align: 'center',
		},
		{
			field: 'datetime',
			headerName: 'DateTime',
			type: 'string',
			width: 150,
			valueGetter: (params) => {
				return params.row.datetime.toLocaleString([], {
					year: '2-digit',
					month: 'numeric',
					day: 'numeric',
					hour: 'numeric',
					minute: 'numeric',
				});
			},
		},

		{
			field: 'actions',
			headerName: 'Actions',
			type: 'actions',
			width: 150,
			getActions: (params: GridRowParams) => [
				<GridActionsCellItem
					icon={<VisibilityIcon color='primary' />}
					label='View'
					onClick={() => {
						navigate(`/events/${params.row.id}`);
					}}
				/>,
				<GridActionsCellItem
					icon={<EditIcon />}
					label='Edit'
					color='secondary'
				/>,
				<GridActionsCellItem
					icon={<DeleteIcon color='error' />}
					label='Delete'
				/>,
			],
		},
	];

	return { eventList, loading, error, fetchEventList, columns } as const;
}
