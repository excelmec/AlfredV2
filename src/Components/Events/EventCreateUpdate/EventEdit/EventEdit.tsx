import {
  Grid,
  Box,
  Typography,
  Paper,
  Divider,
  TextField,
  Select,
  MenuItem,
  Switch,
  Checkbox,
  Button,
  Autocomplete,
  TextFieldProps,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

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
  IEventHead,
} from '../../../../Hooks/Event/eventTypes';

import './EventEdit.css';

import { DateTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import {
  IValidateCreateEvent,
  IValidateUpdateEvent,
} from 'Hooks/Event/create-update/eventValidation';
import { useEventHeadsList } from 'Hooks/Event/eventHeads/useEventHeadsList';
import { StyledTableCell } from 'Components/Commons/TableCell';
import { useNavigate } from 'react-router-dom';
import { ValidationError } from 'yup';

import { debounce } from 'lodash';

type IEventDataForEdit = IValidateCreateEvent | IValidateUpdateEvent;

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
  savingEventError,
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
      <>
        <Typography variant="h4">{'Something went wrong while fetching eventHeads'}</Typography>
        <Typography variant="h5">{eventHeadListError}</Typography>
      </>
    );
  }

  function EventHeadChoose({
    eventHeadIdField,
  }: {
    eventHeadIdField: Exclude<keyof IValidateUpdateEvent, undefined | null>;
  }) {
    if (eventHeadListLoading) {
      return <Typography>EventHeads Loading...</Typography>;
    }

    if (Array.isArray(eventHeadsList) && eventHeadsList.length === 0) {
      return (
        <>
          <Typography>
            Please Create an Event Head first to assign them to events as Heads
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              navigate('/events/heads/create');
            }}
          >
            Create Event Head
          </Button>
        </>
      );
    }

    return (
      <Autocomplete
        sx={{ width: '100%' }}
        options={eventHeadsList}
        autoHighlight
        getOptionLabel={(option: IEventHead) => option.name}
        onChange={(event, newValue) => {
          if (newValue) {
            console.log({ newValue });
            setNewEvent((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                [eventHeadIdField]: newValue.id,
              };
            });
          }
        }}
        disabled={eventHeadListLoading}
        value={eventHeadsList.find((eventHead) => {
          return eventHead.id === newEvent[eventHeadIdField];
        })}
        renderOption={(props, eventHead) => (
          <Box component="li" {...props}>
            <StyledTableCell
              sx={{
                width: '50%',
                overflow: 'hidden',
              }}
            >
              {eventHead.name}
            </StyledTableCell>
            <StyledTableCell
              sx={{
                width: '50%',
                overflow: 'hidden',
              }}
            >
              {eventHead.phoneNumber}
            </StyledTableCell>
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Choose an Event Head"
            inputProps={{
              ...params.inputProps,
              autoComplete: 'new-password', // disable autocomplete and autofill
            }}
          />
        )}
      />
    );
  }

  function CustomTextField({
    fieldName,
    TextFieldProps,
    onChange,
  }: {
    fieldName: Exclude<keyof IValidateUpdateEvent, undefined | null>;
    TextFieldProps?: TextFieldProps;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) {
    function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
      setNewEvent((prev) => {
        if (!prev) return prev;
        if (!e.target.name) {
          console.error('No name in target');
        }
        if (e.target.value === undefined || e.target.value === null) {
          return { ...prev, [e.target.name]: '' };
        }
        return { ...prev, [e.target.name]: e.target.value };
      });
    }

    return (
      <TextField
        value={newEvent[fieldName] ?? ''}
        name={fieldName}
        onChange={onChange ? onChange : handleTextChange}
        fullWidth
        error={validationErrors.some((error) => {
          return error.path === fieldName;
        })}
        helperText={
          validationErrors.find((error) => {
            return error.path === fieldName;
          })?.message ?? ''
        }
        {...TextFieldProps}
      />
    );
  }

  return (
    <Box className="event-edit-container" component={Paper} elevation={1} borderRadius={0}>
      <div
        className="event-edit-overlay"
        style={{
          display: savingEvent ? 'block' : 'none',
        }}
      ></div>
      <Grid
        container
        spacing={2}
        justifyContent="center"
        alignItems="center"
        className="event-edit-grid"
      >
        <Grid item xs={12}>
          <Typography variant="h5">Event Basic Details</Typography>
        </Grid>
        {id && (
          <>
            <Grid item xs={6}>
              <Typography>ID</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>{id}</Typography>
            </Grid>
          </>
        )}

        <Grid item xs={6}>
          <Typography>Name</Typography>
        </Grid>
        <Grid item xs={6}>
          {CustomTextField({ fieldName: 'name' })}
        </Grid>

        <Grid item xs={6}>
          <Typography>Icon</Typography>
        </Grid>
        <Grid item xs={6} container justifyContent="center" alignItems="center">
          <Grid item xs={6}>
            {newEvent?.icon ? (
              <img
                src={selectedIconUrl}
                referrerPolicy="no-referrer"
                style={{
                  maxWidth: '70px',
                  maxHeight: '70px',
                  objectFit: 'contain',
                }}
                alt="Event Logo"
              />
            ) : (
              <Typography color={'error'}>No Icon Uploaded</Typography>
            )}
          </Grid>
          <Grid item xs={6}>
            <input
              accept="image/*"
              type="file"
              style={{ display: 'none' }}
              id="icon-upload"
              onChange={(e) => {
                if (e.target.files) {
                  setNewEvent((prev) => {
                    if (!prev) return prev;
                    if (!e.target.files) return prev;

                    if (e.target.files.length === 0) return prev;

                    return {
                      ...prev,
                      icon: e.target.files[0],
                    };
                  });
                }
              }}
            />
            <label htmlFor="icon-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUploadIcon />}
                size="small"
              >
                Choose Icon
              </Button>
            </label>
          </Grid>
        </Grid>

        <Grid item xs={6}>
          <Typography>Event Type</Typography>
        </Grid>
        <Grid item xs={6}>
          <Select
            value={newEvent.eventTypeId ?? ''}
            fullWidth
            name="eventTypeId"
            onChange={(e) => {
              setNewEvent((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  eventTypeId: e.target.value as TEventTypeId,
                };
              });
            }}
          >
            {EventTypeIds.map((id) => {
              return (
                <MenuItem value={id} key={id}>
                  {EventTypeIdToString[id]}
                </MenuItem>
              );
            })}
          </Select>
        </Grid>

        <Grid item xs={6}>
          <Typography>Event Category</Typography>
        </Grid>
        <Grid item xs={6}>
          <Select
            value={newEvent.categoryId ?? ''}
            fullWidth
            name="categoryId"
            onChange={(e) => {
              setNewEvent((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  categoryId: e.target.value as TCategoryId,
                };
              });
            }}
          >
            {CategoryIds.map((id) => {
              return (
                <MenuItem value={id} key={id}>
                  {CategoryIdToString[id]}
                </MenuItem>
              );
            })}
          </Select>
        </Grid>

        <Grid item xs={6}>
          <Typography>Event Venue</Typography>
        </Grid>
        <Grid item xs={6}>
          {CustomTextField({ fieldName: 'venue' })}
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5">Event Registration Details</Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography>Needs Registration?</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography>
            <Checkbox
              checked={newEvent.needRegistration ?? false}
              onChange={(e) => {
                setNewEvent((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    needRegistration: e.target.checked,
                  };
                });
              }}
            />
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography>Is Team?</Typography>
        </Grid>
        <Grid item xs={6}>
          <Checkbox
            checked={newEvent.isTeam ?? false}
            onChange={(e) => {
              setNewEvent((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  isTeam: e.target.checked,
                  teamSize: e.target.checked ? 1 : 0,
                };
              });
            }}
          />
        </Grid>

        {newEvent?.isTeam && (
          <>
            <Grid item xs={6}>
              <Typography>Team Size</Typography>
            </Grid>
            <Grid item xs={6}>
              {CustomTextField({
                fieldName: 'teamSize',
                TextFieldProps: {
                  type: 'number',
                },
              })}
            </Grid>
          </>
        )}

        <Grid item xs={6}>
          <Typography>Register Button Text</Typography>
        </Grid>
        <Grid item xs={6}>
          {CustomTextField({ fieldName: 'button' })}
        </Grid>

        <Grid item xs={6}>
          <Typography>Registration Link</Typography>
        </Grid>
        <Grid item xs={6}>
          {CustomTextField({
            fieldName: 'registrationLink',
          })}
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5">Event Timeline Details</Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography>Event Day</Typography>
        </Grid>
        <Grid item xs={6}>
          {CustomTextField({
            fieldName: 'day',
            TextFieldProps: {
              type: 'number',
            },
          })}
        </Grid>

        <Grid item xs={6}>
          <Typography>Event DateTime</Typography>
        </Grid>
        <Grid item xs={6}>
          <DateTimePicker
            value={newEvent.datetime ? dayjs(newEvent.datetime) : ''}
            sx={{
              width: '100%',
            }}
            onChange={(e) => {
              setNewEvent((prev) => {
                if (!prev) return prev;

                if (!e) {
                  return {
                    ...prev,
                    datetime: new Date(),
                  };
                }

                return {
                  ...prev,
                  datetime: new Date(e.toString()),
                };
              });
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <Typography>Event Status</Typography>
        </Grid>
        <Grid item xs={6}>
          <Select
            value={newEvent.eventStatusId ?? ''}
            fullWidth
            name="eventStatusId"
            onChange={(e) => {
              setNewEvent((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  eventStatusId: e.target.value as TEventStatusId,
                };
              });
            }}
          >
            {EventStatusIds.map((id) => {
              return (
                <MenuItem value={id} key={id}>
                  {EventStatusIdToString[id]}
                </MenuItem>
              );
            })}
          </Select>
        </Grid>

        <Grid item xs={6}>
          <Typography>Number of Rounds</Typography>
        </Grid>
        <Grid item xs={6}>
          {CustomTextField({
            fieldName: 'numberOfRounds',
            TextFieldProps: {
              type: 'number',
            },
            onChange: (e) => {
              setNewEvent((prev) => {
                if (!prev) return prev;
                const newNumberOfRounds = parseInt(e.target.value);
                let newCurrentRound = prev.currentRound;

                if (newNumberOfRounds === 0) {
                  newCurrentRound = 0;
                }

                return {
                  ...prev,
                  numberOfRounds: newNumberOfRounds,
                  currentRound: newCurrentRound,
                };
              });
            },
          })}
        </Grid>

        {newEvent?.numberOfRounds && newEvent.numberOfRounds > 0 ? (
          <>
            <Grid item xs={6}>
              <Typography>Current Round</Typography>
            </Grid>
            <Grid item xs={6}>
              {CustomTextField({
                fieldName: 'currentRound',
                TextFieldProps: {
                  type: 'number',
                },
              })}
            </Grid>
          </>
        ) : null}

        <Grid item xs={6}>
          <Typography>Registrations Open?</Typography>
        </Grid>
        <Grid item xs={6}>
          <Switch
            checked={newEvent.registrationOpen ?? false}
            onChange={(e) => {
              setNewEvent((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  registrationOpen: e.target.checked,
                };
              });
            }}
          />
        </Grid>

        <Grid item xs={6}>
          <Typography>Registrations End DateTime</Typography>
        </Grid>
        <Grid item xs={6}>
          <DateTimePicker
            value={newEvent.registrationEndDate ? dayjs(newEvent.registrationEndDate) : ''}
            sx={{
              width: '100%',
            }}
            onChange={(e) => {
              setNewEvent((prev) => {
                if (!prev) return prev;

                if (!e) {
                  return {
                    ...prev,
                    registrationEndDate: new Date(),
                  };
                }

                return {
                  ...prev,
                  registrationEndDate: new Date(e.toString()),
                };
              });
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5">Event Prize and Fee</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography>Entry Fee</Typography>
        </Grid>
        <Grid item xs={6}>
          {CustomTextField({
            fieldName: 'entryFee',
            TextFieldProps: {
              type: 'number',
            },
          })}
        </Grid>

        <Grid item xs={6}>
          <Typography>Prize Money</Typography>
        </Grid>
        <Grid item xs={6}>
          {CustomTextField({
            fieldName: 'prizeMoney',
            TextFieldProps: {
              type: 'number',
            },
          })}
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5">Event Heads Details</Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography>Event Head 1</Typography>
        </Grid>
        <Grid item xs={6}>
          <EventHeadChoose eventHeadIdField="eventHead1Id" />
        </Grid>

        <Grid item xs={6}>
          <Typography>Event Head 2</Typography>
        </Grid>
        <Grid item xs={6}>
          <EventHeadChoose eventHeadIdField="eventHead2Id" />
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5">Event Information Details</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography>About</Typography>
        </Grid>
        <Grid item xs={6}>
          {CustomTextField({
            fieldName: 'about',
            TextFieldProps: {
              multiline: true,
              rows: 20,
              fullWidth: true,
            },
          })}
        </Grid>

        <Grid item xs={6}>
          <Typography>Format</Typography>
        </Grid>
        <Grid item xs={6}>
          {CustomTextField({
            fieldName: 'format',
            TextFieldProps: {
              multiline: true,
              rows: 20,
              fullWidth: true,
            },
          })}
        </Grid>

        <Grid item xs={6}>
          <Typography>Rules</Typography>
        </Grid>
        <Grid item xs={6}>
          {CustomTextField({
            fieldName: 'rules',
            TextFieldProps: {
              multiline: true,
              rows: 20,
              fullWidth: true,
            },
          })}
        </Grid>
      </Grid>
    </Box>
  );
}
