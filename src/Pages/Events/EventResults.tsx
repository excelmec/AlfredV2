import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material';
import { useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEventDesc } from '../../Hooks/Event/useEventDesc';
import UserContext from 'Contexts/User/UserContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  allEventEditRoles,
  allEventViewRoles,
  specificEventViewRoles,
} from 'Hooks/Event/eventRoles';

export default function EventResults() {
  const { event, fetchEvent, loading, error, setError } = useEventDesc();
  const { userData } = useContext(UserContext);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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
    } else if (userData.roles.some((role) => allEventViewRoles.includes(role))) {
    } else if (userData.roles.some((role) => specificEventViewRoles.includes(role))) {
      if (
        event?.eventHead1?.email === userData.email ||
        event?.eventHead2?.email === userData.email
      ) {
      } else {
        setError('You do not have permission to view this page');
      }
    } else {
      setError('You do not have permission to view this page');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, loading, userData]);

  if (error) {
    return <Typography variant="h5">{error}</Typography>;
  }

  if (loading || !event) {
    return <Typography variant="h5">Loading...</Typography>;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <br />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <Typography variant="h5" noWrap>
          Event Results: {event.name}
        </Typography>
      </Box>
      <br />

      <Box
        sx={{
          width: '90%',
          marginBottom: '20px',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
        component={Paper}
        elevation={2}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            padding: '10px 30px',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          component={Paper}
          elevation={2}
          borderRadius={0}
          zIndex={5}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={() => {
              navigate(-1);
            }}
          >
            Back
          </Button>
          <Box sx={{ flexGrow: 1 }} />
        </Box>

        <Box sx={{ padding: 3 }}>
          <Grid container spacing={2}>
            {event.results && event.results.length > 0 ? (
              <>
                <Grid item xs={12}>
                  <Typography variant="h5">Results</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>

                {/* 1st Place */}
                <Grid item xs={3}>
                  <Typography>1st </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography>
                    {event.results.length >= 1 ? event.results[0].teamName : ''}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>
                    {event.results.length >= 1 ? event.results[0].teamMembers : ''}
                  </Typography>
                </Grid>

                {/* 2nd Place */}
                <Grid item xs={3}>
                  <Typography>2nd </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography>
                    {event.results.length >= 2 ? event.results[1].teamName : ''}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>
                    {event.results.length >= 2 ? event.results[1].teamMembers : ''}
                  </Typography>
                </Grid>

                {/* 3rd Place */}
                <Grid item xs={3}>
                  <Typography>3rd </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography>
                    {event.results.length >= 3 ? event.results[2].teamName : ''}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>
                    {event.results.length >= 3 ? event.results[2].teamMembers : ''}
                  </Typography>
                </Grid>
              </>
            ) : (
              <Grid item xs={12}>
                <Typography align="center">No results declared yet.</Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
