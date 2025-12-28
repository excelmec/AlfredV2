import {
  CategoryIds,
  EventStatusIds,
  EventTypeIds,
  IEvent,
  TCategoryId,
  TEventStatusId,
  TEventTypeId,
} from '../eventTypes';
import { InferType, ObjectSchema, boolean, date, mixed, number, object, string } from 'yup';

export const eventValidationSchema: ObjectSchema<
  Omit<
    IEvent,
    | 'eventStatus'
    | 'category'
    | 'eventType'
    | 'eventHead1'
    | 'eventHead2'
    | 'icon'
    | 'id'
    | 'results'
  > & { icon: File | undefined }
> = object().shape({
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
      then: (schema) => schema.moreThan(0, 'Current Round must be positive'),
      otherwise: (schema) => schema.is([0]),
    })
    .test(
      'currentRound',
      'Current Round must be less than or equal to Number of Rounds',
      function (val) {
        if (val === null || val === undefined) return true;
        if (this.parent.numberOfRounds === undefined) return true;
        return val <= this.parent.numberOfRounds;
      },
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
        `Max File size is 1MB. Your File size: ${value ? value.size / 1024 / 1024 : 'undefined'} `,
      (value) => {
        const fileSizeInMB = value.size / 1024 / 1024;
        return fileSizeInMB <= 1;
      },
    ),
});

interface IEventValidate extends InferType<typeof eventValidationSchema> {}

export interface IValidateUpdateEvent extends IEventValidate {}

export interface IValidateCreateEvent extends IEventValidate {}

export const updateEventValidationSchema = eventValidationSchema;

export const createEventValidationSchema = eventValidationSchema;

export const defaultDummyEvent: IValidateUpdateEvent = {
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
};

export function objectToFormData(event: IValidateCreateEvent | IValidateUpdateEvent) {
  const eventFormData = new FormData();

  Object.keys(event).forEach((key) => {
    const objectKey = key as keyof typeof event;
    if (!objectKey) return;

    const value = event[objectKey];

    if (!value) return;

    const firstCharUpperKey = key.charAt(0).toUpperCase() + key.slice(1);

    if (value instanceof Date) {
      function padTwoDigit(num: number) {
        return (num < 10 ? '0' : '') + num;
      }

      /**
       * The date time format expected by the backend is YYYY-MM-DDTHH:MM:SS.
       * We cannot use toISOString() because it returns the date time in UTC
       * with 'Z' at the end.
       * The Backend will parse the date time string in the local timezone
       * Thus we need to convert the date time to local timezone and then
       * mimic the ISO format.
       */
      const year = value.getFullYear();
      const month = padTwoDigit(value.getMonth() + 1);
      const day = padTwoDigit(value.getDate());
      const hour = padTwoDigit(value.getHours());
      const minute = padTwoDigit(value.getMinutes());
      const second = padTwoDigit(value.getSeconds());
      const formattedDate = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
      eventFormData.append(firstCharUpperKey, formattedDate);
      return;
    } else if (value instanceof File) {
      eventFormData.append(firstCharUpperKey, value);
      return;
    } else if (!value.toString()) {
      return;
    } else {
      eventFormData.append(firstCharUpperKey, value.toString());
    }
  });

  return eventFormData;
}
