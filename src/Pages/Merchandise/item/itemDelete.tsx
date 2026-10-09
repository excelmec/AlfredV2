import { useContext, useState } from 'react';
import { toast } from 'sonner';
import { ApiContext } from 'Contexts/Api/ApiContext';
import { ConfirmDialog } from '@/Components/confirm-dialog';

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
    <ConfirmDialog
      open={parameters.dialogueOpen}
      title={`Delete item #${parameters?.id ?? ''}`}
      description={`Would you like to delete item: ${parameters?.name ?? ''}?`}
      confirmLabel="Delete"
      destructive
      loading={eventIsDeleting}
      onConfirm={() => handleDelete(parameters?.id as number)}
      onCancel={handleDeleteClose}
    />
  );
};

export default MerchItemDelete;
