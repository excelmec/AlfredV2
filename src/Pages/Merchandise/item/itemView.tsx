import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useItemView } from '../../../Hooks/Merchandise/useItemView';
import ItemDetails from 'Components/Merchandise/ItemViewDetails/ItemViewDetails';
import ItemViewToolBar from 'Components/Merchandise/ItemViewDetails/ToolBar/ItemViewToolBar';
import { PageHeader } from '@/Components/page-header';
import { PageError, PageLoading } from '@/Components/page-state';

export default function MerchItemViewPage() {
  const { item, fetchItem, loading, error } = useItemView();

  const { itemId: itemIdStr } = useParams();
  const itemId = parseInt(itemIdStr ?? '');

  useEffect(() => {
    fetchItem(itemId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  if (error) {
    return <PageError>{error}</PageError>;
  }

  if (loading) {
    return <PageLoading />;
  }

  if (!item) {
    return <PageError title="Item not found" />;
  }

  return (
    <>
      <PageHeader title={item.name} description="Item description" />
      <ItemViewToolBar itemId={itemId} />
      <ItemDetails item={item} key={itemId} />
    </>
  );
}
