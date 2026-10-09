import { useEffect, useState } from 'react';
import lodash from 'lodash';
import CreateSchedule from 'Components/Events/EventSchedule/CreateSchedule';
import EventEditToolBar from 'Components/Events/EventSchedule/CreateScheduleToolBar';
import {
  defaultDummyEvent,
  IValidateCreateEventSchedule,
} from 'Hooks/Event/create-update/eventScheduleValidation';
import { useScheduleList } from 'Hooks/Event/useScheduleList';
import { PageHeader } from '@/Components/page-header';
import { PageError } from '@/Components/page-state';

export default function EventScheduleCreate() {
  const {
    newEvent,
    setNewEvent,
    validationErrors,
    createSchedule,
    validateSchedule,
    creatingSchedule,
    error: creatingScheduleError,
  } = useScheduleList();

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  useEffect(() => {
    if (lodash.isEqual(defaultDummyEvent, newEvent)) {
      setHasUnsavedChanges(false);
    } else {
      setHasUnsavedChanges(true);
    }
  }, [newEvent]);

  if (creatingScheduleError) {
    return <PageError>{creatingScheduleError}</PageError>;
  }

  return (
    <>
      <PageHeader title="Add event schedule" description="Schedule a round for an event." />

      <EventEditToolBar
        saveChanges={createSchedule}
        hasUnsavedChanges={hasUnsavedChanges}
        savingEvent={creatingSchedule}
      />

      <CreateSchedule
        newEvent={newEvent as IValidateCreateEventSchedule}
        setNewEvent={setNewEvent}
        savingEvent={creatingSchedule}
        savingEventError={creatingScheduleError}
        validateEvent={validateSchedule}
        validationErrors={validationErrors}
      />
    </>
  );
}
