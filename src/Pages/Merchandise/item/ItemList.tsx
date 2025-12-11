import { Button, Typography } from '@mui/material';

import { DataGrid, GridActionsCellItem, GridRowParams, GridToolbar } from '@mui/x-data-grid';

import { useEffect, useState } from 'react';

import { useItemList } from '../../../Hooks/Merchandise/useItemList';
import { IItem } from 'Hooks/Merchandise/itemTypes';

import { useNavigate } from 'react-router-dom';

import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import MerchItemDelete from './itemDelete';
import { IEventListItem } from 'Hooks/Event/eventTypes';

function getRowId(row: IItem) {
  return row.id;
}

export default function MerchItemListPage() {
  const { itemList, fetchItemList, loading, error, columns } = useItemList();

  const navigate = useNavigate();
  const [deleteDialoge, setDeleteDialoge] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Pick<IEventListItem, 'id' | 'name'> | undefined>();

  const muiColumns = [
    ...columns,
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 150,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={<VisibilityIcon color="primary" />}
          label="View"
          onClick={() => {
            navigate(`/merch/items/view/${params.row.id}`);
          }}
        />,
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          color="secondary"
          onClick={() => {
            navigate(`/merch/items/edit/${params.row.id}`);
          }}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon color="error" />}
          label="Delete"
          onClick={() => {
            setDeleteItem({ id: params.row.id, name: params.row.name });
          }}
        />,
      ],
    },
  ];

  // function confirmDelete() {
  // 	setDeleteOpen(true);
  // }

  // async function handleDelete(eventId: number, eventName: string) {
  // 	await deleteEvent(eventId, eventName);
  // 	handleDeleteClose();
  // }

  // const handleDeleteClose = () => {
  // 	if (eventIsDeleting) {
  // 		return;
  // 	}
  // 	setDeleteOpen(false);
  // };

  useEffect(() => {
    fetchItemList();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return <Typography variant="h5">{error}</Typography>;
  }

  const handleDeleteDialogueClose = () => {
    setDeleteItem(undefined);
    fetchItemList();
  };

  return (
    <>
      <br />
      <Typography variant="h5" noWrap component="div">
        Merchandise Items List
      </Typography>
      <br />
      <Button size="small" variant="contained" onClick={() => navigate('/merch/items/create')}>
        Create New Item
      </Button>
      <br />
      <DataGrid
        density="compact"
        getRowId={getRowId}
        rows={itemList}
        columns={muiColumns}
        loading={loading}
        sx={{
          width: '90%',
        }}
        autoPageSize
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            printOptions: {
              hideFooter: true,
              hideHeader: true,
              hideToolbar: true,
            },
          },
        }}
        showCellVerticalBorder
        showColumnVerticalBorder
      />

      <MerchItemDelete
        id={deleteItem?.id}
        name={deleteItem?.name}
        dialogueOpen={deleteItem != undefined ? true : false}
        onClose={handleDeleteDialogueClose}
      />
    </>
  );
}
