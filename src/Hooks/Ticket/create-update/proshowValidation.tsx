import { InferType, ObjectSchema, date, object, string } from 'yup';

export const proshowValidationSchema: ObjectSchema<{
  title: string;
  location: string;
  show_time: Date;
}> = object().shape({
  title: string()
    .required('Title is required')
    .min(2, 'Title must be at least 2 characters')
    .max(50, 'Title can be maximum 50 characters'),
  location: string()
    .required('Location is required')
    .min(2, 'Location must be at least 2 characters'),
  show_time: date().required('Show time is required'),
});

export interface IValidateCreateProshow extends InferType<typeof proshowValidationSchema> {}

export const defaultDummyProshow: IValidateCreateProshow = {
  title: '',
  location: '',
  show_time: new Date(),
};
