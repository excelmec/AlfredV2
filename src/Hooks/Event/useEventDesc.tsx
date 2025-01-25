import { useContext, useState } from 'react';
import { ApiContext } from '../../Contexts/Api/ApiContext';
import { getErrMsg } from '../errorParser';
import { IEvent, IResult } from './eventTypes';

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

			interface IResultResponse {
				isTeam: boolean;
				results: IResult[]
			}

			const response = await axiosEventsPrivate.get<IEventResponse>(
				`/api/events/${eventId}`
			);

			const resultsResponse = await axiosEventsPrivate.get<IResultResponse>(
				`/api/Result/event/${eventId}`
			);

			resultsResponse.data.results.sort((a: IResult, b: IResult) => {
				return a.position - b.position
			})

			const eventData: IEvent = {
				...response.data,
				datetime: new Date(response.data?.datetime),
				registrationEndDate: new Date(response.data?.registrationEndDate),
				results: resultsResponse.data.results
			};

			setEvent(eventData);
			return eventData;
		} catch (error) {
			setError(getErrMsg(error));
		} finally {
			setLoading(false);
		}
	}

	return { event, loading, error, fetchEvent, setError } as const;
}
