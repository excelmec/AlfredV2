export enum ESize {
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
  XXL = 'XXL',
}

export const sizeOptions: ESize[] = [ESize.S, ESize.M, ESize.L, ESize.XL, ESize.XXL];

export enum EMediaObjectType {
  image = 'image',
}

export const mediaObjectTypes: EMediaObjectType[] = [EMediaObjectType.image];

export interface IMediaObject {
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
  sizeOption: ESize;
  count: number;
}

export interface IItem {
  id: number;
  name: string;
  description: string;
  price: number;
  sizeOptions: ESize[];
  colorOptions: string[];
  canBePreordered: boolean;

  mediaObjects: IMediaObject[];
  stockCount: IStockCount[];
}
