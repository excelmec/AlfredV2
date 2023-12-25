import { useContext, useState } from 'react';
import { ApiContext } from '../../Contexts/Api/ApiContext';
import {
	IUpdateNetworkError,
	IUpdateSuccess,
	IUpdateValidationError,
	TupdateFnReturn,
	getErrMsg,
} from '../errorParser';
import {
	CategoryIds,
	EventStatusIds,
	EventTypeIds,
	IEvent,
	TCategoryId,
	TEventStatusId,
	TEventTypeId,
} from './eventTypes';
import {
	InferType,
	ObjectSchema,
	ValidationError,
	boolean,
	date,
	mixed,
	number,
	object,
	string,
} from 'yup';

export const eventValidationSchema: ObjectSchema<
	Omit<
		IEvent,
		| 'eventStatus'
		| 'category'
		| 'eventType'
		| 'eventHead1'
		| 'eventHead2'
		| 'icon'
	> & { icon: File | undefined }
> = object({
	id: number().required(),

	name: string()
		.required()
		.min(2, 'Event Name must be minimum 2 characters')
		.max(50, 'Event Name can be maximum 50 characters'),

	venue: string().required().min(2, 'Venue must be minimum 2 characters'),
	needRegistration: boolean()
		.required()
		.default(false)
		.transform((val) => {
			if (val === null || val === undefined) return false;
			return val;
		}),
	day: number()
		.required()
		.transform((val) => {
			if (val === null || val === undefined) return 1;
			return val;
		}),
	datetime: date().required(),

	categoryId: mixed<TCategoryId>().oneOf(CategoryIds).required(),
	eventTypeId: mixed<TEventTypeId>().oneOf(EventTypeIds).required(),

	about: string().required().min(2, 'About must be minimum 2 characters'),
	format: string().required().min(2, 'Format must be minimum 2 characters'),
	rules: string().required().min(2, 'Rules must be minimum 2 characters'),
	entryFee: number()
		.required()
		.transform((val) => {
			if (val === null || val === undefined) return 0;
			return val;
		}),
	prizeMoney: number()
		.required()
		.transform((val) => {
			if (val === null || val === undefined) return 0;
			return val;
		}),
	eventHead1Id: number().required(),
	eventHead2Id: number().required(),
	isTeam: boolean().required(),
	teamSize: number()
		.default(undefined)
		.transform((val) => {
			if (val === null || val === undefined) return 0;
			return val;
		})
		.integer()
		.when('isTeam', {
			is: true,
			then: (schema) => schema.min(1),
			otherwise: (schema) => schema.is([0]),
		}),
	eventStatusId: mixed<TEventStatusId>().oneOf(EventStatusIds).required(),
	numberOfRounds: number()
		.default(undefined)
		.moreThan(-1, 'Number of Rounds must be positive')
		.transform((val) => {
			if (val === null || val === undefined) return 0;
			return val;
		}),

	currentRound: number()
		.default(undefined)
		.transform((val) => {
			if (val === null || val === undefined) return 0;
			return val;
		})
		.when('numberOfRounds', {
			is: (val: number) => val > 0,
			then: (schema) =>
				schema.moreThan(0, 'Current Round must be positive'),
			otherwise: (schema) => schema.is([0]),
		})
		.test(
			'currentRound',
			'Current Round must be less than or equal to Number of Rounds',
			function (val) {
				if (val === null || val === undefined) return true;
				if (this.parent.numberOfRounds === undefined) return true;
				return val <= this.parent.numberOfRounds;
			}
		),

	registrationOpen: boolean()
		.required()
		.default(false)
		.transform((val) => {
			if (val === null || val === undefined) return false;
			return val;
		}),
	registrationEndDate: date().default(undefined),
	button: string()
		.default(undefined)
		.transform((val) => {
			if (val === null || val === undefined) return undefined;
			return val;
		}),
	registrationLink: string()
		.url('Invalid Registration Link URL')
		.default(undefined)
		.transform((val) => {
			if (val === null || val === undefined) return undefined;
			return val;
		}),

	icon: mixed<File>()
		.required()
		.test(
			'fileSize',
			({ value }: { value: File }) =>
				`Max File size is 1MB. Your File size: ${
					value ? value.size / 1024 / 1024 : 'undefined'
				} `,
			(value) => {
				const fileSizeInMB = value.size / 1024 / 1024;
				return fileSizeInMB <= 1;
			}
		),
});

export type TnewEventModify = InferType<typeof eventValidationSchema>;

export function useEventEdit() {
	const [newEvent, setNewEvent] = useState<TnewEventModify>({
		id: 0,
		name: '',
		icon: undefined,
		categoryId: 0,
		eventTypeId: 0,
		about: '',
		format: '',
		rules: '',
		entryFee: 0,
		prizeMoney: 0,
		eventHead1Id: 0,

		eventHead2Id: 0,
		isTeam: false,
		teamSize: undefined,
		eventStatusId: 0,
		numberOfRounds: undefined,
		currentRound: undefined,
		registrationOpen: undefined,
		registrationEndDate: undefined,
		button: undefined,
		registrationLink: undefined,
		venue: '',
		needRegistration: false,
		day: 0,
		datetime: new Date(),
	});

	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>('');
	const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
		[]
	);

	const { axiosEventsPrivate } = useContext(ApiContext);

	function validateEvent(): boolean {
		try {
			eventValidationSchema.validateSync(newEvent, {
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

			const newEventFormData = new FormData();

			Object.keys(newEvent).forEach((key) => {
				const objectKey = key as keyof typeof newEvent;
				if (!objectKey) return;

				const value = newEvent[objectKey];

				if (!value) return;

				const firstCharUpperKey =
					key.charAt(0).toUpperCase() + key.slice(1);

				if (value instanceof Date) {
					newEventFormData.append(
						firstCharUpperKey,
						value.toISOString()
					);
					return;
				} else if (value instanceof File) {
					newEventFormData.append(firstCharUpperKey, value);
					return;
				} else if (!value.toString()) {
					return;
				} else {
					newEventFormData.append(
						firstCharUpperKey,
						value.toString()
					);
				}
			});

			console.log([...newEventFormData]);

			const res = await axiosEventsPrivate.put(
				`/api/events`,
				newEventFormData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}
			);
			console.log(res);

			return {
				success: true,
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
