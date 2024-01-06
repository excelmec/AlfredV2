import { useContext, useState } from 'react';
import { ApiContext } from 'Contexts/Api/ApiContext';
import { getErrMsg } from 'Hooks/errorParser';
import { IEventHead } from '../eventTypes';

export function useEventHeadCrud() {
	const [eventHead, setEventHead] = useState<IEventHead>({
		id: 0,
		name: '',
		email: '',
		phoneNumber: '',
	});

	const [eventHeadLoading, setEventHeadLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>('');
	const { axiosEventsPrivate } = useContext(ApiContext);

	async function fetchEventHead(id: number) {
		try {
			setEventHeadLoading(true);
			setError('');

			const response = await axiosEventsPrivate.get<IEventHead>(
				`/api/eventhead/${id}`
			);

			setEventHead(response.data);
		} catch (error) {
			setError(getErrMsg(error));
		} finally {
			setEventHeadLoading(false);
		}
	}

	async function createEventHead(): Promise<boolean> {
		try {
			if (!eventHead.name) {
				setError('Name is required');
				return false;
			}

			if (!eventHead.email) {
				setError('Email is required');
				return false;
			}

			if (!eventHead.phoneNumber) {
				setError('Phone number is required');
				return false;
			}

			setEventHeadLoading(true);
			setError('');

			const response = await axiosEventsPrivate.post<IEventHead>(
				'/api/eventhead',
				eventHead
			);

			setEventHead(response.data);

			return true;
		} catch (error) {
			setError(getErrMsg(error));
			return false;
		} finally {
			setEventHeadLoading(false);
		}
	}

	async function deleteEventHead(id: number, name: string): Promise<boolean> {
		try {
			setEventHeadLoading(true);
			setError('');

			await axiosEventsPrivate.delete(`/api/eventhead/`, {
				data: { id: id, name: name },
			});

			return true;
		} catch (error) {
			setError(getErrMsg(error));
			return false;
		} finally {
			setEventHeadLoading(false);
		}
	}

	async function updateEventHead(): Promise<boolean> {
		try {
			if (!eventHead.name) {
				setError('Name is required');
				return false;
			}

			if (!eventHead.email) {
				setError('Email is required');
				return false;
			}

			if (!eventHead.phoneNumber) {
				setError('Phone number is required');
				return false;
			}

			setEventHeadLoading(true);
			setError('');

			await axiosEventsPrivate.put<IEventHead>(
				'/api/eventhead',
				eventHead
			);

			return true;
		} catch (error) {
			setError(getErrMsg(error));
			return false;
		} finally {
			setEventHeadLoading(false);
		}
	}

	return {
		deleteEventHead,
		setEventHead,
		eventHead,
		fetchEventHead,
		eventHeadLoading,
		error,
		createEventHead,
		updateEventHead,
	} as const;
}
