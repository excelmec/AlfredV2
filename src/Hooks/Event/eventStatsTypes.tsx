import { IEvent } from './eventTypes';

export interface IEventWithStats {
	id: number;
	name: string;
	teamCount: number;
	registrationCount: number;
	eventType: Pick<IEvent, 'eventType'>;
	category: Pick<IEvent, 'category'>;
    needRegistration: boolean | null | undefined;
}
