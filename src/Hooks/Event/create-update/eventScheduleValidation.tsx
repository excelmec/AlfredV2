import {
  IScheduleCreate,
  TDay,
  TRoundId,
} from "../scheduleTypes";

import {
  ObjectSchema,
  date,
  mixed,
  number,
  object,
  string,
} from "yup";

export const eventScheduleValidationSchema: ObjectSchema<IScheduleCreate> = object().shape({
  eventId: number().required(),
  datetime: date().required(),
  day: mixed<TDay>().oneOf([1, 2, 3]).required(),
  roundId: mixed<TRoundId>().oneOf([0, 1, 2]).required(),
  round: string().required().min(2, "Round must be minimum 2 characters"),
});

export interface IValidateCreateEventSchedule extends IScheduleCreate {}

export const createEventScheduleValidationSchema = eventScheduleValidationSchema;

export const defaultDummyEvent: IValidateCreateEventSchedule = {
  eventId: 19,
  datetime: new Date(),
  day: 1,
  roundId: 0,
  round: "",
};
