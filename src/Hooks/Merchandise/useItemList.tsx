import { useContext, useState } from 'react';
import { ApiContext } from 'Contexts/Api/ApiContext';
import { getErrMsg } from 'Hooks/errorParser';
import { IItem } from './itemTypes';
import { TypeSafeColDef } from 'Hooks/gridColumType';

export function useItemList() {
	const [itemList, setItemList] = useState<IItem[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string>('');

	// const [eventIsDeleting, setEventIsDeleting] = useState<boolean>(false);

	const { axiosMerchPrivate } = useContext(ApiContext);

	async function fetchItemList() {
		try {
			setLoading(true);
			setError('');

			const response = await axiosMerchPrivate.get<IItem[]>('/item');

			setItemList(response.data);
		} catch (error) {
			setError(getErrMsg(error));
		} finally {
			setLoading(false);
		}
	}

	// async function deleteEvent(eventId: number, eventName: string) {
	// 	try {
	// 		setEventIsDeleting(true);
	// 		setError('');

	// 		await axiosEventsPrivate.delete(`/api/events/`, {
	// 			data: {
	// 				id: eventId,
	// 				name: eventName,
	// 			},
	// 		});

	// 		await fetchEventList();
	// 	} catch (error) {
	// 		setError(getErrMsg(error));
	// 	} finally {
	// 		setEventIsDeleting(false);
	// 	}
	// }

	const columns: TypeSafeColDef<IItem>[] = [
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
			field: 'price',
			headerName: 'Price',
			type: 'string',
			width: 150,
			align: 'center',
		},

		// TODO: add order statistics
	];

	return {
		itemList,
		loading,
		error,
		fetchItemList,
		columns,
		// deleteEvent,
		// eventIsDeleting,
	} as const;
}
