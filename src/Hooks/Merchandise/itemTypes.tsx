enum ESize {
	S = 'S',
	M = 'M',
	L = 'L',
	XL = 'XL',
	XXL = 'XXL',
}

enum EMediaObjectType {
	image = 'image',
}

interface IMediaObject {
	id: string;
	type: EMediaObjectType;
	url: string;
	colorOption: string;
	viewOrdering: number;
	itemId: number;
}

export interface IStockCount {
	itemId: number;
	colorOption: string;
	sizeOption: string;
	count: number;
}

export interface IItem {
	id: number;
	name: string;
	description: string;
	price: number;
	sizeOptions: ESize[];
	colorOptions: string[];

	mediaObjects: IMediaObject[];
	stockCount: IStockCount[];
}
