export type TEventId = number;
export type TScheduleId = number;
export type TRoundId = 0 | 1 | 2;
export type TDay = 1 | 2 | 3;
export type TDatetime = Date;
export type TRound = string;

export interface IScheduleItem {
  id: number;
  eventId: TEventId;
  name: string;
  icon: string;
  eventType: string;
  category: string;
  venue: string;
  needRegistration: boolean;
  roundId: TRoundId;
  round: TRound;
  day: TDay;
  datetime: TDatetime;
}

// This is the base type for schedule creation/validation
export interface IScheduleCreate {
  eventId: TEventId;
  datetime: TDatetime;
  day: TDay;
  roundId: TRoundId;
  round: TRound;
}

export interface IValidateScheduleItem {
  eventId: number;
  roundId: number;
  round: string;
  day: number;
  datetime: Date;
}
