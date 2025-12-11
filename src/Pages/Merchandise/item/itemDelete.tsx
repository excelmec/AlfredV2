import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { ApiContext } from 'Contexts/Api/ApiContext';
import { useContext, useState } from 'react';
import { toast } from 'react-toastify';

const MerchItemDelete = (parameters: {
  id: number | undefined;
  name: string | undefined;
  dialogueOpen: boolean;
  onClose: () => void;
}) => {
  const [eventIsDeleting, setEventIsDeleting] = useState(false);
  const { axiosMerchPrivate } = useContext(ApiContext);

  async function handleDelete(eventId: number) {
    setEventIsDeleting(true);
    try {
      await axiosMerchPrivate.delete(`/admin/item/${eventId}`);
      toast.success('Deleted Successfully!');
    } catch (error) {
      toast.error('Error! Could not delete item');
    }
    parameters.onClose();
    setEventIsDeleting(false);
  }

  const handleDeleteClose = () => {
    if (eventIsDeleting) {
      return;
    }
    parameters.onClose();
  };

  return (
    <Dialog open={parameters.dialogueOpen} onClose={handleDeleteClose}>
      <DialogTitle>Delete Item with ID: {parameters?.id}</DialogTitle>
      <DialogContent>
        <DialogContentText>Would you like to delete it em: {parameters?.name}?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          style={{
            backgroundColor: 'red',
            color: 'white',
            fontWeight: 'bold',
          }}
          autoFocus
          onClick={() => {
            handleDelete(parameters?.id as number);
          }}
          disabled={eventIsDeleting}
        >
          Delete
        </Button>
        <Button onClick={handleDeleteClose} autoFocus disabled={eventIsDeleting}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MerchItemDelete;
