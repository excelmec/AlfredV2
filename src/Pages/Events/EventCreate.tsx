import { useEffect, useState } from 'react';
import lodash from 'lodash';
import EventEdit from 'Components/Events/EventCreateUpdate/EventEdit/EventEdit';
import EventEditToolBar from 'Components/Events/EventCreateUpdate/ToolBar/EventEditToolBar';
import { defaultDummyEvent } from 'Hooks/Event/create-update/eventValidation';
import { useEventCreate } from 'Hooks/Event/create-update/useEventCreate';
import { PageHeader } from '@/Components/page-header';
import { PageError } from '@/Components/page-state';

export default function EventCreatePage() {
  const {
    newEvent,
    setNewEvent,
    createEvent,
    loading: creatingEvent,
    error: creatingEventError,
    validateEvent,
    validationErrors,
  } = useEventCreate();

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  useEffect(() => {
    if (lodash.isEqual(defaultDummyEvent, newEvent)) {
      setHasUnsavedChanges(false);
    } else {
      setHasUnsavedChanges(true);
    }
  }, [newEvent]);

  if (creatingEventError) {
    return <PageError>{creatingEventError}</PageError>;
  }

  return (
    <>
      <PageHeader title="Create event" description="Fill in the details of the new event." />

      <EventEditToolBar
        saveChanges={createEvent}
        hasUnsavedChanges={hasUnsavedChanges}
        savingEvent={creatingEvent}
      />

      <EventEdit
        newEvent={newEvent!}
        setNewEvent={setNewEvent}
        savingEvent={creatingEvent}
        savingEventError={creatingEventError}
        validateEvent={validateEvent}
        validationErrors={validationErrors}
      />
    </>
  );
}
