import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ValidationError } from 'yup';
import { debounce } from 'lodash';
import { IValidateCreateEventSchedule } from 'Hooks/Event/create-update/eventScheduleValidation';
import { TRoundId } from 'Hooks/Event/scheduleTypes';
import { useEventList } from 'Hooks/Event/useEventsList';
import { Combobox } from '@/Components/combobox';
import { DateTimePicker } from '@/Components/datetime-picker';
import { FormField, FormSection } from '@/Components/form-layout';
import { PageError } from '@/Components/page-state';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';

interface IEventEditProps {
  newEvent: IValidateCreateEventSchedule;
  setNewEvent: React.Dispatch<React.SetStateAction<IValidateCreateEventSchedule>>;
  savingEvent: boolean;
  savingEventError: string;
  validateEvent: () => boolean;
  validationErrors: ValidationError[];
}

const day = [1, 2, 3];
const roundId = [0, 1, 2];

export default function EventEdit({
  newEvent,
  setNewEvent,
  savingEvent,
  validateEvent,
  validationErrors,
}: IEventEditProps) {
  const navigate = useNavigate();
  const {
    eventList,
    fetchEventList,
    error: eventListError,
    loading: eventListLoading,
  } = useEventList();

  useEffect(() => {
    fetchEventList();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    debounce(validateEvent, 300)();
  }, [newEvent, validateEvent]);

  if (eventListError) {
    return (
      <PageError title="Something went wrong while fetching events">{eventListError}</PageError>
    );
  }

  const errorOf = (field: string) =>
    validationErrors.find((error) => error.path === field)?.message;

  return (
    <fieldset disabled={savingEvent} className="min-w-0 disabled:opacity-70">
      <FormSection title="Event schedule details" description="Add a round to an event's schedule.">
        <FormField label="Event" error={errorOf('eventId')}>
          {eventListLoading ? (
            <p className="text-sm text-muted-foreground">Events loading...</p>
          ) : Array.isArray(eventList) && eventList.length === 0 ? (
            <div className="grid gap-2">
              <p className="text-sm text-muted-foreground">
                Please create an event first to assign rounds to it.
              </p>
              <Button
                variant="outline"
                className="w-fit"
                onClick={() => navigate('/events/create')}
              >
                Create event
              </Button>
            </div>
          ) : (
            <Combobox
              options={eventList.map((event) => ({
                value: String(event.id),
                label: event.name,
                description: `ID ${event.id}`,
              }))}
              value={newEvent.eventId ? String(newEvent.eventId) : ''}
              onChange={(v) => setNewEvent((prev) => ({ ...prev, eventId: Number(v) }))}
              placeholder="Choose an event"
              searchPlaceholder="Search events..."
            />
          )}
        </FormField>

        <FormField label="Day" error={errorOf('day')}>
          <Select
            value={String(newEvent.day)}
            onValueChange={(v) =>
              setNewEvent((prev) => ({ ...prev, day: Number(v) as typeof prev.day }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {day.map((value) => (
                <SelectItem key={value} value={String(value)}>
                  Day {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Date & time" error={errorOf('datetime')}>
          <DateTimePicker
            value={newEvent.datetime}
            onChange={(value) => setNewEvent((prev) => ({ ...prev, datetime: value }))}
            invalid={!!errorOf('datetime')}
          />
        </FormField>

        <FormField label="Round ID" error={errorOf('roundId')}>
          <Select
            value={String(newEvent.roundId)}
            onValueChange={(v) =>
              setNewEvent((prev) => ({ ...prev, roundId: Number(v) as TRoundId }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roundId.map((value) => (
                <SelectItem key={value} value={String(value)}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Round text" htmlFor="field-round" error={errorOf('round')}>
          <Input
            id="field-round"
            name="round"
            value={newEvent.round}
            aria-invalid={!!errorOf('round')}
            onChange={(e) => setNewEvent((prev) => ({ ...prev, round: e.target.value }))}
          />
        </FormField>
      </FormSection>
    </fieldset>
  );
}
