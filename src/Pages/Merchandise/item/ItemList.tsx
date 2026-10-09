import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, PencilSimpleIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { useItemList } from '../../../Hooks/Merchandise/useItemList';
import { IItem } from 'Hooks/Merchandise/itemTypes';
import { IEventListItem } from 'Hooks/Event/eventTypes';
import MerchItemDelete from './itemDelete';
import { PageHeader } from '@/Components/page-header';
import { PageError } from '@/Components/page-state';
import { DataTable } from '@/Components/data-table/DataTable';
import { RowAction } from '@/Components/data-table/RowAction';
import type { DataColumn } from '@/Components/data-table/types';
import { Button } from '@/Components/ui/button';

function getRowId(row: IItem) {
  return row.id;
}

export default function MerchItemListPage() {
  const { itemList, fetchItemList, loading, error, columns } = useItemList();

  const navigate = useNavigate();
  const [deleteItem, setDeleteItem] = useState<Pick<IEventListItem, 'id' | 'name'> | undefined>();

  const tableColumns: DataColumn<IItem>[] = [
    ...columns,
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 120,
      getActions: (params) => [
        <RowAction
          key="view"
          icon={<EyeIcon />}
          label="View"
          tone="primary"
          onClick={() => navigate(`/merch/items/view/${params.row.id}`)}
        />,
        <RowAction
          key="edit"
          icon={<PencilSimpleIcon />}
          label="Edit"
          onClick={() => navigate(`/merch/items/edit/${params.row.id}`)}
        />,
        <RowAction
          key="delete"
          icon={<TrashIcon />}
          label="Delete"
          tone="destructive"
          onClick={() => setDeleteItem({ id: params.row.id, name: params.row.name })}
        />,
      ],
    },
  ];

  useEffect(() => {
    fetchItemList();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return <PageError>{error}</PageError>;
  }

  const handleDeleteDialogueClose = () => {
    setDeleteItem(undefined);
    fetchItemList();
  };

  return (
    <>
      <PageHeader
        title="Merchandise items"
        description="Everything available in the merchandise store."
        actions={
          <Button onClick={() => navigate('/merch/items/create')}>
            <PlusIcon weight="bold" /> Create item
          </Button>
        }
      />
      <DataTable
        columns={tableColumns}
        rows={itemList}
        getRowId={getRowId}
        loading={loading}
        exportFileName="merch-items"
        searchPlaceholder="Search items..."
      />

      <MerchItemDelete
        id={deleteItem?.id}
        name={deleteItem?.name}
        dialogueOpen={deleteItem !== undefined ? true : false}
        onClose={handleDeleteDialogueClose}
      />
    </>
  );
}
