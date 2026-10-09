import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import lodash from 'lodash';
import EventEdit from 'Components/Events/EventCreateUpdate/EventEdit/EventEdit';
import EventEditToolBar from 'Components/Events/EventCreateUpdate/ToolBar/EventEditToolBar';
import { useEventDesc } from 'Hooks/Event/useEventDesc';
import { useEventEdit } from 'Hooks/Event/create-update/useEventEdit';
import { PageHeader } from '@/Components/page-header';
import { PageError, PageLoading } from '@/Components/page-state';

export default function EventEditPage() {
  const { id } = useParams<{ id: string }>();
  const { event, fetchEvent, loading, error, setError } = useEventDesc();
  const {
    newEvent,
    setNewEvent,
    updateEvent,
    loading: savingEvent,
    error: savingEventError,
    validateEvent,
    validationErrors,
  } = useEventEdit(id);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [currentIconFile, setCurrentIconFile] = useState<File | undefined>();

  useEffect(() => {
    if (!Number.isInteger(Number(id))) {
      setError('Invalid Event ID');
    }

    fetchEvent(Number(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function initNewEvent() {
    if (!event) return;

    let icon: File | undefined = undefined;

    try {
      if (event.icon) {
        const imageRes = await axios.get(event.icon, {
          responseType: 'blob',
        });

        icon = new File([imageRes.data], 'icon.png', {
          type: imageRes.headers['content-type'] ?? 'image/png',
        });
      }
    } catch (error) {
      console.error('Failed to fetch event icon:', error);
    }

    setNewEvent({
      ...event,
      icon,
    });

    setCurrentIconFile(icon);
  }

  useEffect(() => {
    if (!event) return;

    initNewEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  useEffect(() => {
    if (!currentIconFile) {
      /**
       * The new and old event loading completes when the icon of old event loads as a file
       * Else this will falsely trigger the event changed
       */
      return;
    }

    const oldEvent = {
      ...event,
      icon: currentIconFile,
    };

    if (lodash.isEqual(oldEvent, newEvent)) {
      setHasUnsavedChanges(false);
    } else {
      setHasUnsavedChanges(true);
    }
  }, [newEvent, currentIconFile, event]);

  if (error) {
    return <PageError>{error}</PageError>;
  }

  if (loading) {
    return <PageLoading />;
  }

  if (!event) {
    return <PageError>{'Something went wrong :('}</PageError>;
  }

  return (
    <>
      <PageHeader title="Edit event" description={event.name} />

      <EventEditToolBar
        saveChanges={updateEvent}
        hasUnsavedChanges={hasUnsavedChanges}
        savingEvent={savingEvent}
      />

      <EventEdit
        id={event.id}
        newEvent={newEvent!}
        setNewEvent={setNewEvent}
        savingEvent={savingEvent}
        savingEventError={savingEventError}
        validateEvent={validateEvent}
        validationErrors={validationErrors}
      />
    </>
  );
}
