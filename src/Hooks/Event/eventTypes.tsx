export interface IEventListItem {
	id: number;
	name: string;
	icon: string;
	eventType: TEventTypeString;
	category: TCategoryString;
	venue: string;
	needRegistration: boolean;
	day?: number;
	datetime: Date;
}

export interface IEvent extends IEventListItem {
	categoryId: TCategoryId;
	eventTypeId: TEventTypeId;
	about: string;
	format: string;
	rules: string;
	entryFee: number;
	prizeMoney: number;
	eventHead1Id: number;
	eventHead1: IEventHead;
	eventHead2Id: number;
	eventHead2: IEventHead;
	isTeam: boolean;
	teamSize?: number;
	eventStatusId: number;
	eventStatus: TEventStatusString;
	numberOfRounds?: number;
	currentRound?: number;
	registrationOpen?: boolean;
	registrationEndDate?: Date;
	button: TEventButton;
	registrationLink?: string;

	// rounds: [];
	// registration: null;
}

export interface IEventHead {
	id: number;
	name: string;
	email: string;
	phoneNumber: string;
}

export type TCategoryString = 'non_tech' | 'cs_tech' | 'general_tech' | 'other';
export type TCategoryId = 0 | 1 | 2 | 3;

export const CategoryIds: TCategoryId[] = [0, 1, 2, 3];
export const CategoryIdToString: { [key in TCategoryId]: TCategoryString } = {
	0: 'non_tech',
	1: 'cs_tech',
	2: 'general_tech',
	3: 'other',
};

export const Category: {} = {
	non_tech: 0,
	cs_tech: 1,
	general_tech: 2,
	other: 3,
} as const;

export type TEventTypeString =
	| 'general'
	| 'competition'
	| 'workshop'
	| 'talk'
	| 'conference';
export type TEventTypeId = 0 | 1 | 2 | 3 | 4;

export const EventTypeIds: TEventTypeId[] = [0, 1, 2, 3, 4];
export const EventTypeIdToString: { [key in TEventTypeId]: TEventTypeString } = {
	0: 'general',
	1: 'competition',
	2: 'workshop',
	3: 'talk',
	4: 'conference',
};

export type TEventStatusString = 'yet_to_start' | 'started' | 'finished';
export type TEventStatusId = 0 | 1 | 2;

export const EventStatusIds: TEventStatusId[] = [0, 1, 2];
export const EventStatusIdToString: {
	[key in TEventStatusId]: TEventStatusString;
} = {
	0: 'yet_to_start',
	1: 'started',
	2: 'finished',
};

export type TEventButton = string | undefined;
