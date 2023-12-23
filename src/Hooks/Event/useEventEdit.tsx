import { useContext, useState } from 'react';
import { ApiContext } from '../../Contexts/Api/ApiContext';
import { getErrMsg } from '../errorParser';
import {
	CategoryIds,
	EventButtons,
	EventStatusIds,
	EventTypeIds,
	IEvent,
	TCategoryId,
	TEventButton,
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
	button: mixed<TEventButton>().oneOf(EventButtons).required(),
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
		entryFee: 0,
		prizeMoney: 0,
		eventHead1Id: 0,

		eventHead2Id: 0,
		isTeam: false,
		teamSize: 0,
		eventStatusId: 0,
		numberOfRounds: 0,
		currentRound: 0,
		registrationOpen: false,
		registrationEndDate: new Date(),
		button: 'Form',
		registrationLink: '',
		venue: '',
		needRegistration: false,
		day: 0,
		datetime: new Date(),
	});
	
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string>('');

	const { axiosEventsPrivate } = useContext(ApiContext);

	return { newEvent, setNewEvent, loading, error, setError } as const;
}
