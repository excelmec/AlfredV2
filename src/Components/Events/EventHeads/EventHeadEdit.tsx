import { useEffect } from 'react';
import { toast } from 'sonner';
import { useEventHeadCrud } from 'Hooks/Event/eventHeads/useEventHeadCrud';
import { Button } from '@/Components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';
import { Spinner } from '@/Components/ui/spinner';
import EventHeadFields from './EventHeadFields';

export default function EventHeadEditModal({
  open,
  setOpen,
  refreshList,
  eventHeadId,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refreshList: () => void;
  eventHeadId: number;
}) {
  const { setEventHead, eventHead, eventHeadLoading, error, fetchEventHead, updateEventHead } =
    useEventHeadCrud();

  function handleClose() {
    if (eventHeadLoading) {
      return;
    }

    setOpen(false);
  }

  async function handleSave() {
    if (eventHeadLoading) {
      return;
    }

    const success = await updateEventHead();
    if (success) {
      setOpen(false);
      toast.success('Event head updated successfully');
      refreshList();
      setEventHead({
        id: 0,
        name: '',
        email: '',
        phoneNumber: '',
      });
    }
  }

  useEffect(() => {
    fetchEventHead(eventHeadId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit event head #{eventHead.id}</DialogTitle>
          <DialogDescription>Update the contact details of this event head.</DialogDescription>
        </DialogHeader>
        <EventHeadFields
          eventHead={eventHead}
          setEventHead={setEventHead}
          disabled={eventHeadLoading}
          error={error}
        />
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={eventHeadLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={eventHeadLoading}>
            {eventHeadLoading && <Spinner />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
