import { useContext, useState } from 'react';
import { ApiContext } from 'Contexts/Api/ApiContext';
import { getErrMsg } from 'Hooks/errorParser';
import { IEventListItem } from './eventTypes';
import { TypeSafeColDef } from 'Hooks/gridColumType';
import { GridRenderCellParams, GridValueGetterParams } from '@mui/x-data-grid';

export function useEventList() {
	const [eventList, setEventList] = useState<IEventListItem[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string>('');

	const [eventIsDeleting, setEventIsDeleting] = useState<boolean>(false);

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

	async function deleteEvent(eventId: number, eventName: string) {
		try {
			setEventIsDeleting(true);
			setError('');

			await axiosEventsPrivate.delete(`/api/events/`, {
				data: {
					id: eventId,
					name: eventName,
				},
			});

			await fetchEventList();
		} catch (error) {
			setError(getErrMsg(error));
		} finally {
			setEventIsDeleting(false);
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
			renderCell: (params: GridRenderCellParams<IEventListItem>) => {
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
			valueGetter: (params: GridValueGetterParams<IEventListItem>) => {
				return params.row.datetime.toLocaleString([], {
					year: '2-digit',
					month: 'numeric',
					day: 'numeric',
					hour: 'numeric',
					minute: 'numeric',
				});
			},
		},
	];

	return {
		eventList,
		loading,
		error,
		setError,
		fetchEventList,
		columns,
		deleteEvent,
		eventIsDeleting,
	} as const;
}
