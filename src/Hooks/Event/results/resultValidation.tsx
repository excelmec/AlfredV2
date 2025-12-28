import { IResult } from '../eventTypes';
import { InferType, ObjectSchema, number, object, string } from 'yup';

export const resultValidationSchema: ObjectSchema<Omit<IResult, 'id' | 'eventId' | 'event'>> =
  object().shape({
    excelId: number()
      .transform((val) => (isNaN(val) ? undefined : val))
      .required('Excel ID is required'),
    teamId: number()
      .transform((val) => (isNaN(val) ? undefined : val))
      .required('Team ID is required'),
    position: number().required('Position is required').min(1, 'Position must be at least 1'),
    name: string().required('Name is required'),
    teamName: string()
      .required('Team Name is required')
      .min(2, 'Team Name must be at least 2 characters'),
    teamMembers: string()
      .required('Team Members are required')
      .min(2, 'Team Members must be at least 2 characters'),
  });

export interface IValidateResult extends InferType<typeof resultValidationSchema> {}

export const defaultResult: IValidateResult = {
  excelId: 0,
  teamId: 0,
  position: 1,
  name: '',
  teamName: '',
  teamMembers: '',
} as unknown as IValidateResult;
