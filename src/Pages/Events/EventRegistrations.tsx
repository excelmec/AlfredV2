import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useEventRegList } from 'Hooks/Event/registrations/useEventReg';
import EventRegContainer from 'Components/Events/EventReg/EventRegContainer';
import { PageHeader } from '@/Components/page-header';
import { PageError, PageLoading } from '@/Components/page-state';

export default function EventRegistrationsListPage() {
  const { eventId: eventIdStr } = useParams<{ eventId: string }>();
  const {
    event,
    eventLoading,
    institutionMap,

    individualRegsLoading,
    eventRegsIndividual,
    regIndividualCols,
    checkInIndividual,

    teamCols,
    eventRegsTeam,
    teamRegsLoading,

    error,
    fetchEventRegList,
    setError,
  } = useEventRegList();

  useEffect(() => {
    if (!eventIdStr) {
      setError('Event ID not found');
      return;
    }
    const eventId = parseInt(eventIdStr);
    if (isNaN(eventId)) {
      setError('Invalid Event ID');
      return;
    }

    fetchEventRegList(eventId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventIdStr]);

  if (error) {
    return <PageError>{error}</PageError>;
  }

  if (eventLoading) {
    return <PageLoading />;
  }

  return (
    <>
      <PageHeader
        title={`Registrations for ${event?.name ?? 'event'}`}
        description="Check people in and review who has registered."
      />
      <EventRegContainer
        event={event}
        institutionMap={institutionMap}
        individualRegsLoading={individualRegsLoading}
        eventRegsIndividual={eventRegsIndividual}
        checkInIndividual={checkInIndividual}
        regIndividualCols={regIndividualCols}
        teamCols={teamCols}
        eventRegsTeam={eventRegsTeam}
        teamRegsLoading={teamRegsLoading}
      />
    </>
  );
}
