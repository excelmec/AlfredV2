import { IItem, IMediaObject, IStockCount } from '../itemTypes';

export interface IMediaObjectEdit
	extends Pick<
		IMediaObject,
		'colorOption' | 'type' | 'viewOrdering' | 'url'
	> {
	fileName: string;
}

export interface IStockCountEdit
	extends Pick<IStockCount, 'colorOption' | 'sizeOption' | 'count'> {}

export interface IItemEdit
	extends Omit<IItem, 'mediaObjects' | 'stockCount' | 'id'> {
	mediaObjects: IMediaObjectEdit[];
	stockCount: IStockCountEdit[];
}

export const dummyEditItem: IItemEdit = {
	name: '',
	description: '',
	price: 0,
	stockCount: [],
	mediaObjects: [],
	sizeOptions: [],
	colorOptions: [],
	canBePreordered: false
};

export interface IMediaObjectEditWithFile extends IMediaObjectEdit {
	file: File;
}

export interface IItemEditWithFile extends IItemEdit {
	mediaObjects: IMediaObjectEditWithFile[];
}

export const dummyEditItemWithFile: IItemEditWithFile = {
	name: '',
	description: '',
	price: 0,
	stockCount: [],
	mediaObjects: [],
	sizeOptions: [],
	colorOptions: [],
	canBePreordered: false
};
