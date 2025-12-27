import { Box, Typography } from '@mui/material';
import { useContext, useEffect } from 'react';
import { useEventDesc } from '../../Hooks/Event/useEventDesc';
import { useParams } from 'react-router-dom';
import ToolBar from '../../Components/Events/EventDesc/ToolBar/ToolBar';
import EventData from '../../Components/Events/EventDesc/EventData/EventData';
import UserContext from 'Contexts/User/UserContext';
import {
  allEventEditRoles,
  allEventViewRoles,
  specificEventViewRoles,
} from 'Hooks/Event/eventRoles';

export default function EventDescPage() {
  const { event, fetchEvent, loading, error, setError } = useEventDesc();
  const { userData } = useContext(UserContext);

  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!Number.isInteger(Number(id))) {
      setError('Invalid Event ID');
    }

    fetchEvent(Number(id));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (loading || !event) return;

    if (userData.roles.some((role) => allEventEditRoles.includes(role))) {
      // This person has edit access to all events, so can view all
    } else if (userData.roles.some((role) => allEventViewRoles.includes(role))) {
      // This person has view access to all events, so can view all
    } else if (userData.roles.some((role) => specificEventViewRoles.includes(role))) {
      // This person only has view access to events where they are the event head
      if (
        event?.eventHead1?.email === userData.email ||
        event?.eventHead2?.email === userData.email
      ) {
        // This person is an event head
      } else {
        setError('You do not have permission to view this page');
      }
    } else {
      // This person has no access to any event
      setError('You do not have permission to view this page');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, loading, userData]);

  if (error) {
    return <Typography variant="h5">{error}</Typography>;
  }

  if (loading) {
    return <Typography variant="h5">Loading...</Typography>;
  }

  return (
    <>
      <br />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Typography variant="h5" noWrap>
          Event Description
        </Typography>
      </Box>
      <br />

      <ToolBar eventId={event!.id} resultsPublished={event?.results && event.results.length > 0} />
      <EventData event={event!} />
    </>
  );
}
