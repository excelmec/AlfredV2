import { useContext, useState } from 'react';
import { ApiContext } from '../../Contexts/Api/ApiContext';
import { getErrMsg } from '../errorParser';
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
	boolean,
	date,
	mixed,
	number,
	object,
	string,
} from 'yup';

const eventValidationSchema: ObjectSchema<
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
	needRegistration: boolean().required(),
	day: number().required(),
	datetime: date().required(),

	categoryId: mixed<TCategoryId>().oneOf(CategoryIds).required(),
	eventTypeId: mixed<TEventTypeId>().oneOf(EventTypeIds).required(),

	about: string().required().min(2, 'About must be minimum 2 characters'),
	format: string().required().min(2, 'Format must be minimum 2 characters'),
	rules: string().required().min(2, 'Rules must be minimum 2 characters'),
	entryFee: number().default(undefined),
	prizeMoney: number().default(undefined),
	eventHead1Id: number().required(),
	eventHead2Id: number().required(),
	isTeam: boolean().required(),
	teamSize: number().default(undefined).positive(),
	eventStatusId: mixed<TEventStatusId>().oneOf(EventStatusIds).required(),
	numberOfRounds: number().default(undefined).positive(),
	currentRound: number().default(undefined).positive(),
	registrationOpen: boolean(),
	registrationEndDate: date().default(undefined),
	button: string().default(undefined),
	registrationLink: string()
		.url('Invalid Registration Link URL')
		.default(undefined),

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
		entryFee: undefined,
		prizeMoney: undefined,
		eventHead1Id: 0,

		eventHead2Id: 0,
		isTeam: false,
		teamSize: undefined,
		eventStatusId: 0,
		numberOfRounds: undefined,
		currentRound: undefined,
		registrationOpen: false,
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

	const { axiosEventsPrivate } = useContext(ApiContext);

	async function updateEvent() {
		try {
			setLoading(true);
			if (!newEvent) return;

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
		} catch (err) {
			console.log(err);
			setError(getErrMsg(err));
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
	} as const;
}
