import { useEffect, useState, type ComponentProps } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadSimpleIcon } from '@phosphor-icons/react';
import { ValidationError } from 'yup';
import { debounce } from 'lodash';

import {
  TCategoryId,
  CategoryIds,
  TEventTypeId,
  EventTypeIds,
  TEventStatusId,
  EventStatusIds,
  EventTypeIdToString,
  CategoryIdToString,
  EventStatusIdToString,
} from '../../../../Hooks/Event/eventTypes';
import {
  IValidateCreateEvent,
  IValidateUpdateEvent,
} from 'Hooks/Event/create-update/eventValidation';
import { useEventHeadsList } from 'Hooks/Event/eventHeads/useEventHeadsList';
import { Combobox } from '@/Components/combobox';
import { DateTimePicker } from '@/Components/datetime-picker';
import { FormField, FormSection, ToggleRow } from '@/Components/form-layout';
import { PageError } from '@/Components/page-state';
import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
import { Input } from '@/Components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { Textarea } from '@/Components/ui/textarea';

type IEventDataForEdit = IValidateCreateEvent | IValidateUpdateEvent;
type FieldName = Exclude<keyof IValidateUpdateEvent, undefined | null>;

interface IEventEditProps {
  newEvent: IEventDataForEdit;
  setNewEvent: React.Dispatch<React.SetStateAction<IEventDataForEdit>>;
  savingEvent: boolean;
  savingEventError: string;
  validateEvent: () => boolean;
  validationErrors: ValidationError[];

  id?: number;
}

export default function EventEdit({
  newEvent,
  setNewEvent,
  savingEvent,
  validateEvent,
  validationErrors,
  id,
}: IEventEditProps) {
  const [selectedIconUrl, setSelectedIconUrl] = useState<string>('');
  const navigate = useNavigate();
  const {
    eventHeadsList,
    fetchEventHeadsList,
    error: eventHeadListError,
    loading: eventHeadListLoading,
  } = useEventHeadsList();

  useEffect(() => {
    fetchEventHeadsList();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!newEvent.icon) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedIconUrl(reader.result as string);
    };
    reader.onerror = (e) => {
      console.error(e);
    };
    reader.readAsDataURL(newEvent.icon);
  }, [newEvent.icon]);

  useEffect(() => {
    debounce(validateEvent, 300)();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newEvent]);

  if (eventHeadListError) {
    return (
      <PageError title="Something went wrong while fetching event heads">
        {eventHeadListError}
      </PageError>
    );
  }

  const errorOf = (field: string) =>
    validationErrors.find((error) => error.path === field)?.message;

  function update(patch: Partial<IValidateUpdateEvent>) {
    setNewEvent((prev) => {
      if (!prev) return prev;
      return { ...prev, ...patch } as IEventDataForEdit;
    });
  }

  /** Called as a function (not a component) so inputs keep focus while typing */
  function textField(
    fieldName: FieldName,
    label: string,
    options?: {
      inputProps?: ComponentProps<typeof Input>;
      hint?: string;
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    },
  ) {
    return (
      <FormField
        label={label}
        htmlFor={`field-${fieldName}`}
        error={errorOf(fieldName)}
        hint={options?.hint}
      >
        <Input
          id={`field-${fieldName}`}
          name={fieldName}
          value={(newEvent[fieldName] as string | number | undefined) ?? ''}
          aria-invalid={!!errorOf(fieldName)}
          onChange={
            options?.onChange ??
            ((e) =>
              update({ [e.target.name]: e.target.value ?? '' } as Partial<IValidateUpdateEvent>))
          }
          {...options?.inputProps}
        />
      </FormField>
    );
  }

  function textArea(fieldName: FieldName, label: string) {
    return (
      <FormField label={label} htmlFor={`field-${fieldName}`} error={errorOf(fieldName)} wide>
        <Textarea
          id={`field-${fieldName}`}
          name={fieldName}
          rows={10}
          value={(newEvent[fieldName] as string | undefined) ?? ''}
          aria-invalid={!!errorOf(fieldName)}
          onChange={(e) =>
            update({ [e.target.name]: e.target.value ?? '' } as Partial<IValidateUpdateEvent>)
          }
        />
      </FormField>
    );
  }

  function eventHeadChoose(eventHeadIdField: 'eventHead1Id' | 'eventHead2Id', label: string) {
    if (eventHeadListLoading) {
      return (
        <FormField label={label}>
          <p className="text-sm text-muted-foreground">Event heads loading...</p>
        </FormField>
      );
    }

    if (Array.isArray(eventHeadsList) && eventHeadsList.length === 0) {
      return (
        <FormField label={label} hint="Create an event head first to assign them to events.">
          <Button variant="outline" onClick={() => navigate('/events/heads/create')}>
            Create event head
          </Button>
        </FormField>
      );
    }

    return (
      <FormField label={label} error={errorOf(eventHeadIdField)}>
        <Combobox
          options={eventHeadsList.map((head) => ({
            value: String(head.id),
            label: head.name,
            description: head.phoneNumber,
          }))}
          value={newEvent[eventHeadIdField] ? String(newEvent[eventHeadIdField]) : ''}
          onChange={(v) => update({ [eventHeadIdField]: Number(v) })}
          placeholder="Choose an event head"
          searchPlaceholder="Search event heads..."
        />
      </FormField>
    );
  }

  function selectField<T extends string | number>(
    name: string,
    label: string,
    value: T | undefined,
    ids: readonly T[],
    toLabel: Record<T, string>,
    onChange: (value: T) => void,
  ) {
    return (
      <FormField label={label} error={errorOf(name)}>
        <Select
          name={name}
          value={value !== undefined && value !== null ? String(value) : ''}
          onValueChange={(v) => {
            const match = ids.find((candidate) => String(candidate) === v);
            if (match !== undefined) onChange(match);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {ids.map((optionId) => (
              <SelectItem key={String(optionId)} value={String(optionId)}>
                {toLabel[optionId]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
    );
  }

  return (
    <fieldset disabled={savingEvent} className="relative grid min-w-0 gap-6 disabled:opacity-70">
      <FormSection title="Basic details" description={id ? `Event ID: ${id}` : undefined}>
        {textField('name', 'Name')}

        <FormField label="Icon" error={errorOf('icon')}>
          <div className="flex items-center gap-3">
            {newEvent?.icon ? (
              <img
                src={selectedIconUrl}
                referrerPolicy="no-referrer"
                className="size-16 rounded-lg border object-contain"
                alt="Event logo"
              />
            ) : (
              <span className="flex size-16 items-center justify-center rounded-lg border border-dashed text-xs text-destructive">
                No icon
              </span>
            )}
            <input
              accept="image/*"
              type="file"
              className="hidden"
              id="icon-upload"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) update({ icon: file });
              }}
            />
            <Button variant="outline" asChild>
              <label htmlFor="icon-upload" className="cursor-pointer">
                <UploadSimpleIcon /> Choose icon
              </label>
            </Button>
          </div>
        </FormField>

        {selectField<TEventTypeId>(
          'eventTypeId',
          'Event type',
          newEvent.eventTypeId as TEventTypeId | undefined,
          EventTypeIds,
          EventTypeIdToString,
          (v) => update({ eventTypeId: v }),
        )}
        {selectField<TCategoryId>(
          'categoryId',
          'Event category',
          newEvent.categoryId as TCategoryId | undefined,
          CategoryIds,
          CategoryIdToString,
          (v) => update({ categoryId: v }),
        )}
        {textField('venue', 'Venue')}
      </FormSection>

      <FormSection title="Registration" description="How people sign up for this event.">
        <ToggleRow label="Needs registration" description="Participants must register first.">
          <Checkbox
            checked={newEvent.needRegistration ?? false}
            onCheckedChange={(checked) => update({ needRegistration: checked === true })}
          />
        </ToggleRow>
        <ToggleRow label="Volunteer call form" description="Show a volunteer form for this event.">
          <Checkbox
            checked={newEvent.needVolunteerForm ?? false}
            onCheckedChange={(checked) => update({ needVolunteerForm: checked === true })}
          />
        </ToggleRow>
        <ToggleRow label="Team event" description="Participants register as teams.">
          <Checkbox
            checked={newEvent.isTeam ?? false}
            onCheckedChange={(checked) =>
              update({ isTeam: checked === true, teamSize: checked === true ? 1 : 0 })
            }
          />
        </ToggleRow>
        {newEvent?.isTeam && textField('teamSize', 'Team size', { inputProps: { type: 'number' } })}
        {textField('button', 'Register button text')}
        {textField('registrationLink', 'Registration link')}
      </FormSection>

      <FormSection title="Timeline" description="When the event happens and registrations close.">
        {textField('day', 'Day', { inputProps: { type: 'number' } })}

        <FormField label="Date & time" error={errorOf('datetime')}>
          <DateTimePicker
            value={newEvent.datetime}
            onChange={(value) => update({ datetime: value })}
            invalid={!!errorOf('datetime')}
          />
        </FormField>

        {selectField<TEventStatusId>(
          'eventStatusId',
          'Event status',
          newEvent.eventStatusId as TEventStatusId | undefined,
          EventStatusIds,
          EventStatusIdToString,
          (v) => update({ eventStatusId: v }),
        )}

        {textField('numberOfRounds', 'Number of rounds', {
          inputProps: { type: 'number' },
          onChange: (e) => {
            const newNumberOfRounds = parseInt(e.target.value);
            update({
              numberOfRounds: newNumberOfRounds,
              currentRound: newNumberOfRounds === 0 ? 0 : newEvent.currentRound,
            });
          },
        })}

        {newEvent?.numberOfRounds && newEvent.numberOfRounds > 0
          ? textField('currentRound', 'Current round', { inputProps: { type: 'number' } })
          : null}

        <ToggleRow label="Registrations open" description="Allow new registrations right now.">
          <Switch
            checked={newEvent.registrationOpen ?? false}
            onCheckedChange={(checked) => update({ registrationOpen: checked })}
          />
        </ToggleRow>

        <FormField label="Registrations end" error={errorOf('registrationEndDate')}>
          <DateTimePicker
            value={newEvent.registrationEndDate}
            onChange={(value) => update({ registrationEndDate: value })}
            invalid={!!errorOf('registrationEndDate')}
          />
        </FormField>
      </FormSection>

      <FormSection title="Prize and fee">
        {textField('entryFee', 'Entry fee', { inputProps: { type: 'number' } })}
        {textField('prizeMoney', 'Prize money', { inputProps: { type: 'number' } })}
        {textField('referralPoints', 'Referral points (campus ambassador)', {
          inputProps: { type: 'number', placeholder: 'Default: 5' },
        })}
      </FormSection>

      <FormSection title="Event heads" description="Who manages this event.">
        {eventHeadChoose('eventHead1Id', 'Event head 1')}
        {eventHeadChoose('eventHead2Id', 'Event head 2')}
      </FormSection>

      <FormSection title="Information">
        {textArea('about', 'About')}
        {textArea('format', 'Format')}
        {textArea('rules', 'Rules')}
      </FormSection>
    </fieldset>
  );
}
