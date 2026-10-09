import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ListChecksIcon, PencilSimpleIcon } from '@phosphor-icons/react';
import { Button } from '@/Components/ui/button';

export default function ItemViewToolBar({ itemId }: { itemId: number }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" onClick={() => navigate('/merch/items')}>
        <ArrowLeftIcon /> Back
      </Button>
      <div className="flex-1" />
      <Button variant="outline">
        <ListChecksIcon /> Orders
      </Button>
      <Button onClick={() => navigate(`/merch/items/edit/${itemId}`)}>
        <PencilSimpleIcon /> Edit
      </Button>
    </div>
  );
}
