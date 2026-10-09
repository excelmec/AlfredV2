import type { ReactNode } from 'react';
import { IEvent, IEventHead } from 'Hooks/Event/eventTypes';
import { DetailCard } from '@/Components/detail-card';
import { Badge } from '@/Components/ui/badge';

const dateTimeFormat: Intl.DateTimeFormatOptions = {
  year: '2-digit',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
};

function YesNo({ value }: { value?: boolean }) {
  return value ? (
    <Badge className="bg-primary/10 text-primary" variant="secondary">
      Yes
    </Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground">
      No
    </Badge>
  );
}

function HeadInfo({ head }: { head?: IEventHead | null }): ReactNode {
  if (!head) return null;
  return (
    <div className="space-y-0.5">
      <div>{head.name}</div>
      <div className="text-xs font-normal text-muted-foreground">{head.phoneNumber}</div>
      <div className="text-xs font-normal text-muted-foreground">{head.email}</div>
    </div>
  );
}

export default function EventData({ event }: { event: IEvent }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <DetailCard
        title="Basic details"
        items={[
          { label: 'ID', value: event.id },
          { label: 'Name', value: event.name },
          {
            label: 'Icon',
            value: event.icon ? (
              <img
                src={event.icon}
                referrerPolicy="no-referrer"
                className="size-16 rounded-lg border object-contain"
                alt="Event logo"
              />
            ) : (
              <span className="text-muted-foreground">No icon uploaded</span>
            ),
          },
          { label: 'Event type', value: event.eventType },
          { label: 'Category', value: event.category },
          { label: 'Venue', value: event.venue },
        ]}
      />

      <DetailCard
        title="Timeline"
        items={[
          {
            label: 'Day',
            value: event.day !== undefined && event.day !== null ? event.day : 'Not specified',
          },
          { label: 'Date & time', value: event.datetime?.toLocaleString([], dateTimeFormat) },
          { label: 'Status', value: event.eventStatus },
          {
            label: 'Results published',
            value: <YesNo value={!!event.results && event.results.length > 0} />,
          },
          { label: 'Number of rounds', value: event.numberOfRounds },
          { label: 'Current round', value: event.currentRound },
          { label: 'Registrations open', value: <YesNo value={event.registrationOpen} /> },
          {
            label: 'Registrations end',
            value: event.registrationEndDate?.toLocaleString([], dateTimeFormat),
          },
        ]}
      />

      <DetailCard
        title="Prize and fee"
        items={[
          { label: 'Entry fee', value: event.entryFee },
          { label: 'Prize money', value: event.prizeMoney },
          {
            label: 'Referral points (campus ambassador)',
            value: event.referralPoints ?? 'Default (0)',
          },
        ]}
      />

      <DetailCard
        title="Event heads"
        items={[
          { label: 'Event head 1', value: <HeadInfo head={event.eventHead1} /> },
          { label: 'Event head 2', value: <HeadInfo head={event.eventHead2} /> },
        ]}
      />

      <DetailCard
        title="Registration"
        items={[
          { label: 'Needs registration', value: <YesNo value={event.needRegistration} /> },
          { label: 'Volunteer call form needed', value: <YesNo value={event.needVolunteerForm} /> },
          { label: 'Team event', value: <YesNo value={event.isTeam} /> },
          ...(event.isTeam ? [{ label: 'Team size', value: event.teamSize }] : []),
          { label: 'Register button', value: event.button },
          { label: 'Registration link', value: event.registrationLink },
        ]}
      />

      <DetailCard
        title="Information"
        columns={1}
        items={[
          { label: 'About', value: <p className="whitespace-pre-wrap">{event.about}</p> },
          { label: 'Format', value: <p className="whitespace-pre-wrap">{event.format}</p> },
          { label: 'Rules', value: <p className="whitespace-pre-wrap">{event.rules}</p> },
        ]}
      />
    </div>
  );
}
