import {
  Grid,
  Box,
  Typography,
  Paper,
  TextField,
  TextFieldProps,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  Autocomplete,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { ChangeEventHandler, useEffect } from 'react';
import { IValidateCreateEventSchedule } from 'Hooks/Event/create-update/eventScheduleValidation';
import { ValidationError } from 'yup';
import { debounce } from 'lodash';
import { TRoundId } from 'Hooks/Event/scheduleTypes';
import { useEventList } from 'Hooks/Event/useEventsList';
import { useNavigate } from 'react-router-dom';
import { IEventListItem } from 'Hooks/Event/eventTypes';
import { StyledTableCell } from 'Components/Commons/TableCell';

interface IEventEditProps {
  newEvent: IValidateCreateEventSchedule;
  setNewEvent: React.Dispatch<React.SetStateAction<IValidateCreateEventSchedule>>;
  savingEvent: boolean;
  savingEventError: string;
  validateEvent: () => boolean;
  validationErrors: ValidationError[];
}

type TextFieldKeys = Exclude<keyof IValidateCreateEventSchedule, 'datetime'>;

const day = [1, 2, 3];
const roundId = [0, 1, 2];

function EventIdChoose({
  eventList,
  eventListLoading,
  newEvent,
  setNewEvent,
  navigate,
}: {
  eventList: IEventListItem[];
  eventListLoading: boolean;
  newEvent: IValidateCreateEventSchedule;
  setNewEvent: React.Dispatch<React.SetStateAction<IValidateCreateEventSchedule>>;
  navigate: ReturnType<typeof useNavigate>;
}) {
  if (eventListLoading) {
    return <Typography>Events Loading...</Typography>;
  }

  if (Array.isArray(eventList) && eventList.length === 0) {
    return (
      <>
        <Typography>Please Create an Event first to assign rounds to it</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            navigate('/events/create');
          }}
        >
          Create Event
        </Button>
      </>
    );
  }

  return (
    <Autocomplete
      sx={{ width: '100%' }}
      options={eventList}
      autoHighlight
      getOptionLabel={(option: IEventListItem) => option.name}
      onChange={(event, newValue) => {
        if (newValue) {
          setNewEvent((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              eventId: newValue.id,
            };
          });
        }
      }}
      disabled={eventListLoading}
      value={eventList.find((event) => event.id === newEvent.eventId) || null}
      renderOption={(props, event) => (
        <Box component="li" {...props}>
          <StyledTableCell
            sx={{
              width: '50%',
              overflow: 'hidden',
            }}
          >
            {event.id}
          </StyledTableCell>
          <StyledTableCell
            sx={{
              width: '50%',
              overflow: 'hidden',
            }}
          >
            {event.name}
          </StyledTableCell>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Choose an Event"
          inputProps={{
            ...params.inputProps,
            autoComplete: 'new-password',
          }}
        />
      )}
    />
  );
}

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
      <>
        <Typography variant="h4">{'Something went wrong while fetching events'}</Typography>
        <Typography variant="h5">{eventListError}</Typography>
      </>
    );
  }

  function CustomTextField({
    fieldName,
    TextFieldProps,
  }: {
    fieldName: TextFieldKeys;
    TextFieldProps?: TextFieldProps;
  }) {
    function handleTextChange(e: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent<string>) {
      const value = e.target.value;
      setNewEvent((prev) => {
        if (!prev) return prev;

        if (fieldName === 'eventId' || fieldName === 'day') {
          return { ...prev, [fieldName]: Number(value) };
        }
        if (fieldName === 'roundId') {
          return { ...prev, [fieldName]: Number(value) as TRoundId };
        }
        // For 'round' field
        return { ...prev, [fieldName]: value };
      });
    }

    if (fieldName === 'day' || fieldName === 'roundId') {
      return (
        <Select
          value={newEvent[fieldName] as number}
          onChange={
            handleTextChange as (event: SelectChangeEvent<number>, child: React.ReactNode) => void
          }
          fullWidth
          error={validationErrors.some((error) => error.path === fieldName)}
        >
          {(fieldName === 'day' ? day : roundId).map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </Select>
      );
    }

    return (
      <TextField
        value={newEvent[fieldName]}
        name={fieldName}
        onChange={handleTextChange as ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>}
        fullWidth
        error={validationErrors.some((error) => error.path === fieldName)}
        helperText={validationErrors.find((error) => error.path === fieldName)?.message ?? ''}
        {...TextFieldProps}
      />
    );
  }

  return (
    <Box className="event-edit-container" component={Paper} elevation={1} borderRadius={0}>
      <div className="event-edit-overlay" style={{ display: savingEvent ? 'block' : 'none' }}></div>
      <Grid
        container
        spacing={2}
        justifyContent="center"
        alignItems="center"
        className="event-edit-grid"
      >
        <Grid item xs={12}>
          <Typography variant="h5">Event Schedule details</Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography>Event</Typography>
        </Grid>
        <Grid item xs={6}>
          <EventIdChoose
            eventList={eventList}
            eventListLoading={eventListLoading}
            newEvent={newEvent}
            setNewEvent={setNewEvent}
            navigate={navigate}
          />
        </Grid>

        <Grid item xs={6}>
          <Typography>Day</Typography>
        </Grid>
        <Grid item xs={6}>
          {CustomTextField({
            fieldName: 'day',
            TextFieldProps: { type: 'number' },
          })}
        </Grid>

        <Grid item xs={6}>
          <Typography>DateTime</Typography>
        </Grid>
        <Grid item xs={6}>
          <DateTimePicker
            value={dayjs(newEvent.datetime)}
            sx={{ width: '100%' }}
            onChange={(e) => {
              setNewEvent((prev) => ({
                ...prev,
                datetime: e ? new Date(e.toLocaleString()) : new Date(),
              }));
            }}
          />
        </Grid>

        <Grid item xs={6}>
          <Typography>Round ID</Typography>
        </Grid>
        <Grid item xs={6}>
          {CustomTextField({
            fieldName: 'roundId',
            TextFieldProps: { type: 'number' },
          })}
        </Grid>

        <Grid item xs={6}>
          <Typography>Round Text</Typography>
        </Grid>
        <Grid item xs={6}>
          {CustomTextField({ fieldName: 'round' })}
        </Grid>
      </Grid>
    </Box>
  );
}
