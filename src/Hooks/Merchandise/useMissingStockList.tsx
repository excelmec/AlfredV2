import { useContext, useState } from 'react';
import { ApiContext } from 'Contexts/Api/ApiContext';

interface IMissingStock {
  itemId: number;
  itemName: string;
  colorOption: string;
  sizeOption: string;
  neededQty: number;
}

export function useMissingStockList() {
  const [missingStockList, setMissingStockList] = useState<IMissingStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { axiosMerchPrivate } = useContext(ApiContext);

  const columns = [
    { field: 'itemName', headerName: 'Item Name', flex: 1 },
    { field: 'colorOption', headerName: 'Color', width: 150 },
    { field: 'sizeOption', headerName: 'Size', width: 150 },
    { field: 'neededQty', headerName: 'Quantity Needed', width: 210 },
  ];

  const fetchMissingStockList = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axiosMerchPrivate.get('/admin/missingStock');
      setMissingStockList(res.data.missingStock);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load missing stock');
    } finally {
      setLoading(false);
    }
  };

  return { missingStockList, loading, error, columns, fetchMissingStockList };
}
