import { useContext, useState } from 'react';
import { ApiContext } from '../Contexts/Api/ApiContext';
import { getErrMsg } from './errorParser';

export interface Event {
	id: number;
	name: string;
	icon: string;
	eventType: string;
	category: string;
	venue: string;
	needRegistration: boolean;
	day: number;
	datetime: string;
}

export function useEventList() {
	const [eventList, setEventList] = useState<Event[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string>('');

	const { axiosEventsPrivate } = useContext(ApiContext);
	async function fetchEventList() {
		try {
			setLoading(true);
			setError('');
			const response = await axiosEventsPrivate.get<Event[]>(
				'/api/events'
			);

			setEventList(response.data);
		} catch (error) {
			setError(getErrMsg(error));
		} finally {
			setLoading(false);
		}
	}

	return { eventList, loading, error, fetchEventList } as const;
}
