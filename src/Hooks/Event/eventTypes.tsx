export interface IEventListItem {
	id: number;
	name: string;
	icon: string;
	eventType: EventType;
	category: Category;
	venue: string;
	needRegistration: boolean;
	day: number;
	datetime: Date;
}

export interface IEvent extends IEventListItem {
	categoryId: number;
	eventTypeId: number;
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
	teamSize: number;
	eventStatusId: number;
	eventStatus: EventStatus;
	numberOfRounds: number;
	currentRound: number;
	registrationOpen: boolean;
	registrationEndDate: Date;
	button: EventButton;
	registrationLink: string;

	// rounds: [];
	// registration: null;
}

export interface IEventHead {
	id: number;
	name: string;
	email: string;
	phoneNumber: string;
}

export type Category = 'non_tech' | 'cs_tech' | 'general_tech' | 'other';

export type EventType =
	| 'general'
	| 'competition'
	| 'workshop'
	| 'talk'
	| 'conference';

export type EventStatus = 'yet_to_start' | 'started' | 'finished';

export type EventButton = 'Form';
