import { useContext, useState } from 'react';
import { ApiContext } from 'Contexts/Api/ApiContext';
import { getErrMsg } from 'Hooks/errorParser';
import { IItem } from './itemTypes';

export function useItemView() {
  const [item, setItem] = useState<IItem>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const { axiosMerchPrivate } = useContext(ApiContext);

  async function fetchItem(itemId: number) {
    try {
      setLoading(true);
      setError('');

      const response = await axiosMerchPrivate.get<IItem>(`/item/${itemId}`);

      setItem(response.data);
    } catch (error) {
      setError(getErrMsg(error));
    } finally {
      setLoading(false);
    }
  }

  return {
    item,
    loading,
    error,
    fetchItem,
  } as const;
}
