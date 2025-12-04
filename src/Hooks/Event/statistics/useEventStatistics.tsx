import { useContext, useState } from 'react';
import { ApiContext } from 'Contexts/Api/ApiContext';
import { getErrMsg } from 'Hooks/errorParser';
import { TypeSafeColDef } from 'Hooks/gridColumType';
import { IEventWithStats } from '../eventStatsTypes';

export function useEventStatistics() {
  const { axiosEventsPrivate } = useContext(ApiContext);

  const [eventStatsArray, setEventStatsArray] = useState<IEventWithStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  async function fetchEventStatistics() {
    try {
      setLoading(true);
      const response = await axiosEventsPrivate.get<IEventWithStats[]>(`/api/events/data`);

      setEventStatsArray(response.data);
      console.log(response.data);
    } catch (error) {
      setError(getErrMsg(error));
    } finally {
      setLoading(false);
    }
  }

  const eventStatsCols: TypeSafeColDef<IEventWithStats>[] = [
    {
      field: 'id',
      headerName: 'Event ID',
      type: 'string',
      align: 'center',
      headerAlign: 'center',
      width: 100,
    },
    {
      field: 'name',
      headerName: 'Event Name',
      type: 'string',
      align: 'center',
      headerAlign: 'center',
      width: 200,
    },
    {
      field: 'registrationCount',
      headerName: 'Registration (individual)',
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      width: 180,
    },
    {
      field: 'teamCount',
      headerName: 'Registration Team count',
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      width: 180,
    },
    {
      field: 'eventType',
      headerName: 'Event Type',
      type: 'string',
      align: 'center',
      headerAlign: 'center',
      width: 150,
    },
    {
      field: 'category',
      headerName: 'Category',
      type: 'string',
      align: 'center',
      headerAlign: 'center',
      width: 150,
    },
  ];

  return {
    eventStatsCols,
    eventStatsArray,
    loading,
    error,
    setError,
    fetchEventStatistics,
  } as const;
}
