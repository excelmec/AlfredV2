import { ObjectSchema, array, mixed, number, object, string } from 'yup';
import { IItemEditWithFile } from './itemEditTypes';
import {
	EMediaObjectType,
	ESize,
	mediaObjectTypes,
	sizeOptions,
} from '../itemTypes';

export const itemValidationSchema: ObjectSchema<IItemEditWithFile> =
	object().shape({
		name: string()
			.required()
			.min(2, 'Item Name must be minimum 2 characters')
			.max(50, 'Item Name can be maximum 50 characters'),

		description: string()
			.required()
			.min(2, 'Description must be minimum 2 characters'),

		price: number()
			.required()
			.transform((val) => {
				if (val === null || val === undefined) return 0;
				return val;
			})
			.positive('Price must be positive'),

		sizeOptions: array()
			.of(mixed<ESize>().oneOf(sizeOptions).required())
			.required()
			.min(1, 'Must have at least 1 size option'),

		colorOptions: array()
			.of(string().required())
			.required()
			.min(1, 'Must have at least 1 color option')
			.test('unique', 'Color Options must be unique', (value) => {
				if (!value) return true;
				const lowerCaseValue = value.map((v) => v.toLowerCase());
				const set = new Set(lowerCaseValue);
				return set.size === lowerCaseValue.length;
			}),

		mediaObjects: array()
			.of(
				object()
					.shape({
						type: mixed<EMediaObjectType>()
							.oneOf(mediaObjectTypes)
							.required(),
						url: string().required(),
						colorOption: string().required(),
						viewOrdering: number().required(),
						fileName: string().required(),
						file: mixed<File>().required(),
					})
					.required()
			)
			.required(),

		stockCount: array()
			.of(
				object()
					.shape({
						colorOption: string().required(),
						sizeOption: mixed<ESize>()
							.oneOf(sizeOptions)
							.required(),
						count: number()
							.transform((value) =>
								Number.isNaN(value) ? null : value
							)
							.nullable()
							.required('Stock Count is Required')
							.min(
								0,
								'Stock Count must be greater than or equal to 0'
							),
					})
					.required()
			)
			.required(),
	});
