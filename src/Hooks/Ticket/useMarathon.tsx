import { useContext, useState, useCallback, useMemo } from 'react';
import { ApiContext } from 'Contexts/Api/ApiContext';
import { getErrMsg } from 'Hooks/errorParser';
import {
  IAttendeeUploadResponse,
  IMarathonEventCreate,
  IMarathonAttendee,
  IMarathonEventResponse,
  IMarathonStats,
} from './ticketTypes';

export function useMarathon() {
  const { axiosTicketsPrivate } = useContext(ApiContext);

  const [stats, setStats] = useState<IMarathonStats[]>([]);
  const [events, setEvents] = useState<IMarathonEventResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [attendees, setAttendees] = useState<IMarathonAttendee[]>([]);
  const [creating, setCreating] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadResult, setUploadResult] = useState<IAttendeeUploadResponse | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, eventsRes] = await Promise.all([
        axiosTicketsPrivate.get<IMarathonStats[]>('/marathon/stats'),
        axiosTicketsPrivate.get<IMarathonEventResponse[]>('/marathon/events'),
      ]);
      setStats(statsRes.data);
      setEvents(eventsRes.data);
      const attendeesRes =
        await axiosTicketsPrivate.get<IMarathonAttendee[]>('/marathon/attendees');
      setAttendees(attendeesRes.data);
    } catch (err) {
      setError(getErrMsg(err));
    } finally {
      setLoading(false);
    }
  }, [axiosTicketsPrivate]);

  const createEvent = useCallback(
    async (data: IMarathonEventCreate) => {
      try {
        setCreating(true);
        setError('');
        const response = await axiosTicketsPrivate.post<IMarathonEventResponse>(
          '/marathon/events',
          data,
        );
        await fetchAll();
        return response.data;
      } catch (err) {
        setError(getErrMsg(err));
        return null;
      } finally {
        setCreating(false);
      }
    },
    [axiosTicketsPrivate, fetchAll],
  );

  const uploadAttendees = useCallback(
    async (file: File) => {
      try {
        setUploading(true);
        setUploadError('');
        setUploadResult(null);

        const formData = new FormData();
        formData.append('file', file);

        const response = await axiosTicketsPrivate.post<IAttendeeUploadResponse>(
          '/marathon/attendees',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } },
        );
        setUploadResult(response.data);
        await fetchAll();
        return response.data;
      } catch (err) {
        setUploadError(getErrMsg(err));
        return null;
      } finally {
        setUploading(false);
      }
    },
    [axiosTicketsPrivate, fetchAll],
  );

  const clearUploadResult = useCallback(() => {
    setUploadResult(null);
    setUploadError('');
  }, []);

  return useMemo(
    () => ({
      stats,
      events,
      attendees,
      loading,
      error,
      creating,
      uploading,
      uploadError,
      uploadResult,
      fetchAll,
      createEvent,
      uploadAttendees,
      clearUploadResult,
    }),
    [
      stats,
      events,
      attendees,
      loading,
      error,
      creating,
      uploading,
      uploadError,
      uploadResult,
      fetchAll,
      createEvent,
      uploadAttendees,
      clearUploadResult,
    ],
  );
}
