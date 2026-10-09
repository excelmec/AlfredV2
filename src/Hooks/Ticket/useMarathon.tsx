import { useContext, useState, useCallback, useMemo, useRef } from 'react';
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
  const { axiosTicketsPrivate, accessToken } = useContext(ApiContext);

  const [stats, setStats] = useState<IMarathonStats[]>([]);
  const [events, setEvents] = useState<IMarathonEventResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [attendees, setAttendees] = useState<IMarathonAttendee[]>([]);
  const [creating, setCreating] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadResult, setUploadResult] = useState<IAttendeeUploadResponse | null>(null);

  // Only the newest fetchAll may update state, so an older request that failed with 401
  // (before the token refreshed) can't overwrite the result of the retry that succeeded.
  const latestFetch = useRef(0);

  const fetchAll = useCallback(async () => {
    // Wait until the login token is available, otherwise the requests 401 and race on refresh
    if (!accessToken) return;
    const fetchId = ++latestFetch.current;
    try {
      setLoading(true);
      setError('');
      const [statsRes, eventsRes] = await Promise.all([
        axiosTicketsPrivate.get<IMarathonStats[]>('/marathon/stats'),
        axiosTicketsPrivate.get<IMarathonEventResponse[]>('/marathon/events'),
      ]);
      if (fetchId !== latestFetch.current) return;
      setStats(statsRes.data);
      setEvents(eventsRes.data);
      const attendeesRes =
        await axiosTicketsPrivate.get<IMarathonAttendee[]>('/marathon/attendees');
      if (fetchId !== latestFetch.current) return;
      setAttendees(attendeesRes.data);
    } catch (err) {
      if (fetchId === latestFetch.current) setError(getErrMsg(err));
    } finally {
      if (fetchId === latestFetch.current) setLoading(false);
    }
  }, [axiosTicketsPrivate, accessToken]);

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
        const detail = (err as any)?.response?.data?.detail;
        setUploadError(typeof detail === 'string' ? detail : getErrMsg(err));
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
