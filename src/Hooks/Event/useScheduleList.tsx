import { useCallback, useContext, useState } from 'react';
import { ApiContext } from 'Contexts/Api/ApiContext';
import {
  getErrMsg,
  IUpdateNetworkError,
  IUpdateSuccess,
  IUpdateValidationError,
  TupdateFnReturn,
} from 'Hooks/errorParser';
import { IEvent, IScheduleItem } from './eventTypes';
import { TypeSafeColDef } from 'Hooks/gridColumType';
import { GridValueGetterParams } from '@mui/x-data-grid';
import {
  createEventScheduleValidationSchema,
  defaultDummyEvent,
  IValidateCreateEventSchedule,
} from './create-update/eventScheduleValidation';
import { ValidationError } from 'yup';
import { AxiosResponse } from 'axios';

export function useScheduleList() {
  const [newEvent, setNewEvent] = useState<IValidateCreateEventSchedule>(defaultDummyEvent);
  const [eventList, setEventList] = useState<IScheduleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [creatingSchedule, setCreatingSchedule] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const [eventIsDeleting, setEventIsDeleting] = useState<boolean>(false);

  const { axiosEventsPrivate } = useContext(ApiContext);

  async function fetchEventList() {
    try {
      setLoading(true);
      setError('');

      interface IScheduleResponse {
        day: number;
        events: Array<{
          id: number;
          name: string;
          icon: string;
          eventType: string;
          category: string;
          venue: string;
          needRegistration: boolean;
          roundId: number;
          round: string;
          day: number;
          datetime: string;
        }>;
      }

      const response = await axiosEventsPrivate.get<IScheduleResponse[]>('/api/schedule');

      let eventListData: IScheduleItem[] = response.data
        .flatMap((daySchedule) => daySchedule.events)
        .map((event, index) => ({
          ...event,
          datetime: new Date(event.datetime),
          id: index + 1,
          eventId: event.id,
        }));

      setEventList(eventListData);
    } catch (error) {
      setError(getErrMsg(error));
    } finally {
      setLoading(false);
    }
  }

  async function deleteEvent(eventId: number, eventName: string) {
    try {
      setEventIsDeleting(true);
      setError('');

      await axiosEventsPrivate.delete(`/api/events/`, {
        data: {
          id: eventId,
          name: eventName,
        },
      });

      await fetchEventList();
    } catch (error) {
      setError(getErrMsg(error));
    } finally {
      setEventIsDeleting(false);
    }
  }

  const columns: TypeSafeColDef<IScheduleItem>[] = [
    {
      field: 'id',
      headerName: 'ID',
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      width: 10,
    },
    {
      field: 'eventId',
      headerName: 'Event ID',
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      width: 100,
    },
    {
      field: 'name',
      headerName: 'Name',
      type: 'string',
      width: 200,
    },
    {
      field: 'eventType',
      headerName: 'Event Type',
      type: 'string',
      width: 100,
    },
    {
      field: 'roundId',
      headerName: 'RoundId',
      type: 'number',
      width: 80,
    },
    {
      field: 'round',
      headerName: 'Round',
      type: 'string',
      width: 200,
    },
    {
      field: 'day',
      headerName: 'Day',
      type: 'number',
      width: 10,
      align: 'center',
    },
    {
      field: 'datetime',
      headerName: 'DateTime',
      type: 'string',
      width: 150,
      valueGetter: (params: GridValueGetterParams<IScheduleItem>) => {
        return params.row.datetime.toLocaleString([], {
          year: '2-digit',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
        });
      },
    },
  ];

  const updateScheduleItem = async (
    selectedEvent: IScheduleItem | null,
    round: string,
    roundId: number,
    newDatetime: Date,
    day: number,
  ) => {
    try {
      setError('');
      const formattedDate = newDatetime.toLocaleString();

      await axiosEventsPrivate.put(`/api/schedule`, {
        eventId: selectedEvent?.eventId,
        round,
        roundId,
        day,
        datetime: formattedDate,
      });

      setEventList((prevList) =>
        prevList.map((event) =>
          event.eventId === selectedEvent?.eventId && event.roundId === selectedEvent?.roundId
            ? { ...event, round, roundId, datetime: newDatetime, day }
            : event,
        ),
      );
    } catch (error) {
      setError(getErrMsg(error));
      throw error;
    }
  };

  const deleteScheduleItem = async (eventId: number, roundId: number) => {
    try {
      setError('');
      const response = await axiosEventsPrivate.delete(`/api/schedule`, {
        data: {
          eventId,
          roundId,
        },
      });

      if (response.status === 200) {
        setEventList((prevList) => prevList.filter((event) => event.eventId !== eventId));
      } else {
        setError(`Failed to delete event schedule entry.`);
      }
    } catch (error) {
      setError(getErrMsg(error));
      throw error;
    }
  };

  const validateSchedule = useCallback((): boolean => {
    try {
      createEventScheduleValidationSchema.validateSync(newEvent, {
        abortEarly: false,
        stripUnknown: true,
      });
      setValidationErrors([]);
      return true;
    } catch (err: any) {
      if (err instanceof ValidationError) {
        setValidationErrors(err.inner);
        console.log(err.inner);
      } else {
        console.log(err);
        setError(err?.message);
      }
      return false;
    }
  }, [newEvent]);

  async function createSchedule(): Promise<TupdateFnReturn> {
    try {
      console.log({ newEvent });
      setCreatingSchedule(true);

      if (!validateSchedule()) {
        return {
          success: false,
          validationError: validationErrors,
        } as IUpdateValidationError;
      }

      const scheduleFormData = newEvent;

      const createRes = await axiosEventsPrivate.post<{ id: number }>(
        '/api/schedule',
        scheduleFormData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      if (!createRes.data?.id) {
        setError('Something went wrong when creating schedule. Schedule ID not found');
      }

      return {
        success: true,
        id: createRes.data?.id,
      } as IUpdateSuccess;
    } catch (err) {
      console.log(err);
      const errMsg = getErrMsg(err);
      setError(errMsg);
      return {
        success: false,
        networkError: errMsg,
      } as IUpdateNetworkError;
    } finally {
      setCreatingSchedule(false);
    }
  }

  return {
    eventList,
    loading,
    error,
    setError,
    fetchEventList,
    columns,
    deleteEvent,
    eventIsDeleting,
    updateScheduleItem,
    newEvent,
    setNewEvent,
    validationErrors,
    setValidationErrors,
    createSchedule,
    validateSchedule,
    creatingSchedule,
    deleteScheduleItem,
  } as const;
}
