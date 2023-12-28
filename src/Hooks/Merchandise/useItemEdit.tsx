import { useContext, useState } from 'react';
import { ApiContext } from 'Contexts/Api/ApiContext';
import { getErrMsg } from 'Hooks/errorParser';
import { IItemEditWithFile, dummyEditItemWithFile } from './itemEditTypes';

export function useItemEdit() {
	const [item, setItem] = useState<IItemEditWithFile>(dummyEditItemWithFile);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string>('');

	const { axiosMerchPrivate } = useContext(ApiContext);

	async function updateItem(itemId: number) {
		try {
			setLoading(true);
			// const response = await axiosMerchPrivate.get('/item');
			// setItem(response.data);
			setLoading(false);
		} catch (err) {
			setError(getErrMsg(err));
		} finally {
			setLoading(false);
		}
	}

	return {
		item,
		setItem,
		loading,
		error,

		updateItem,
	} as const;
}
