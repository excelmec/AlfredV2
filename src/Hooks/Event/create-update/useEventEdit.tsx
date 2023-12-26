import { useContext, useState } from 'react';
import { ApiContext } from '../../../Contexts/Api/ApiContext';
import {
	IUpdateNetworkError,
	IUpdateSuccess,
	IUpdateValidationError,
	TupdateFnReturn,
	getErrMsg,
} from '../../errorParser';
import { ValidationError } from 'yup';
import {
	IValidateUpdateEvent,
	defaultDummyEvent,
	objectToFormData,
	updateEventValidationSchema,
} from './eventValidation';

export function useEventEdit(id: string | undefined) {
	if (!id) {
		throw new Error('Invalid Event ID');
	}
	const eventId = parseInt(id);

	const [newEvent, setNewEvent] =
		useState<IValidateUpdateEvent>(defaultDummyEvent);

	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>('');
	const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
		[]
	);

	const { axiosEventsPrivate } = useContext(ApiContext);

	function validateEvent(): boolean {
		try {
			updateEventValidationSchema.validateSync(newEvent, {
				abortEarly: false,
				stripUnknown: true,
			});
			setValidationErrors([]);
			return true;
		} catch (err: any) {
			if (err instanceof ValidationError) {
				setValidationErrors(err.inner);
				console.log(err.inner);
			} else {
				console.log(err);
				setError(err?.message);
			}
			return false;
		}
	}

	async function updateEvent(): Promise<TupdateFnReturn> {
		try {
			console.log({ newEvent });
			setLoading(true);

			if (!validateEvent()) {
				return {
					success: false,
					validationError: validationErrors,
				} as IUpdateValidationError;
			}

			const updatedEventFormData = objectToFormData(newEvent);

			updatedEventFormData.append('Id', String(eventId));

			await axiosEventsPrivate.put(`/api/events`, updatedEventFormData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			return {
				success: true,
				eventId: eventId,
			} as IUpdateSuccess;
		} catch (err) {
			console.log(err);
			const errMsg = getErrMsg(err);
			setError(errMsg);
			return {
				success: false,
				networkError: errMsg,
			} as IUpdateNetworkError;
		} finally {
			setLoading(false);
		}
	}

	return {
		newEvent,
		setNewEvent,
		loading,
		error,
		setError,
		updateEvent,

		validateEvent,
		validationErrors,
	} as const;
}
