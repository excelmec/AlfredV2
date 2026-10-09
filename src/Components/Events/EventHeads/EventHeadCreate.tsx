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

export default function EventHeadCreateModal({
  open,
  setOpen,
  refreshList,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refreshList: () => void;
}) {
  const { setEventHead, eventHead, eventHeadLoading, error, createEventHead } = useEventHeadCrud();

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

    const success = await createEventHead();
    if (success) {
      setOpen(false);
      toast.success('Event head created successfully');
      refreshList();
      setEventHead({
        id: 0,
        name: '',
        email: '',
        phoneNumber: '',
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create event head</DialogTitle>
          <DialogDescription>
            Add a person who can manage registrations for events.
          </DialogDescription>
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
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
