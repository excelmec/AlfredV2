import { useContext, useState } from 'react';
import { ApiContext } from '../../Contexts/Api/ApiContext';
import { getErrMsg } from '../errorParser';
import { IEvent } from './eventTypes';

export function useEventDesc() {
	const [event, setEvent] = useState<IEvent>();
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string>('');

	const { axiosEventsPrivate } = useContext(ApiContext);
	async function fetchEvent(eventId: number) {
		try {
			setLoading(true);
			setError('');

			interface IEventResponse extends Omit<IEvent, 'datetime' | 'registrationEndDate'> {
				datetime: string;
				registrationEndDate: string;
			}

			const response = await axiosEventsPrivate.get<IEventResponse>(
				`/api/events/${eventId}`
			);

			const eventData: IEvent = {
				...response.data,
				datetime: new Date(response.data?.datetime),
				registrationEndDate: new Date(response.data?.registrationEndDate),
			};

			setEvent(eventData);
		} catch (error) {
			setError(getErrMsg(error));
		} finally {
			setLoading(false);
		}
	}

	return { event, loading, error, fetchEvent, setError } as const;
}
