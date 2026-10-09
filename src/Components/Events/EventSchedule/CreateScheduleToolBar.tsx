import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { TupdateFnReturn } from 'Hooks/errorParser';
import SaveToolbar from '@/Components/save-toolbar';

export default function EventEditToolBar({
  saveChanges,
  hasUnsavedChanges,
  savingEvent,
}: {
  saveChanges: () => Promise<TupdateFnReturn>;
  hasUnsavedChanges: boolean;
  savingEvent: boolean;
}) {
  const navigate = useNavigate();

  async function saveEvent() {
    try {
      const res = await saveChanges();

      if (res.success) {
        toast.success('Event Saved.');
        navigate(`/events/schedule`, {
          replace: true,
        });
        return;
      }

      if (res.validationError) {
        toast.error('Please fix the errors to continue.');

        const firstErrorName = res.validationError[0]?.path;
        if (!firstErrorName) return;

        const firstErrorElem = document.getElementsByName(firstErrorName)[0];

        if (!firstErrorElem) return;

        firstErrorElem.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });

        return;
      }
    } catch (error: any) {
      console.log(error);
      toast.error(`Error saving event: ${error?.message}`);
    }
  }

  return (
    <SaveToolbar onSave={saveEvent} hasUnsavedChanges={hasUnsavedChanges} saving={savingEvent} />
  );
}
