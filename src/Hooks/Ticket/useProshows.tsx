import { useContext, useState, useCallback, useMemo } from 'react';
import { ApiContext } from 'Contexts/Api/ApiContext';
import { getErrMsg } from 'Hooks/errorParser';
import {
  IProshowStats,
  IProshowCreate,
  IProshowResponse,
  IDistributeResponse,
} from './ticketTypes';
import { TypeSafeColDef } from 'Hooks/gridColumType';

const statsColumns: TypeSafeColDef<IProshowStats>[] = [
  { field: 'proshow_title', headerName: 'Proshow', width: 200 },
  { field: 'total', headerName: 'Total Tickets', type: 'number', width: 120 },
  { field: 'created', headerName: 'Created', type: 'number', width: 100 },
  { field: 'emailed', headerName: 'Emailed', type: 'number', width: 100 },
  { field: 'email_failed', headerName: 'Failed', type: 'number', width: 100 },
  { field: 'scanned', headerName: 'Scanned', type: 'number', width: 100 },
];

export function useProshows() {
  const { axiosTicketsPrivate } = useContext(ApiContext);

  const [stats, setStats] = useState<IProshowStats[]>([]);
  const [proshows, setProshows] = useState<IProshowResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [creating, setCreating] = useState<boolean>(false);
  const [distributing, setDistributing] = useState<boolean>(false);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosTicketsPrivate.get<IProshowStats[]>('/stats');
      setStats(response.data);
    } catch (err) {
      setError(getErrMsg(err));
    } finally {
      setLoading(false);
    }
  }, [axiosTicketsPrivate]);

  const fetchProshows = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosTicketsPrivate.get<IProshowResponse[]>('/proshows');
      setProshows(response.data);
    } catch (err) {
      setError(getErrMsg(err));
    } finally {
      setLoading(false);
    }
  }, [axiosTicketsPrivate]);

  const createProshow = useCallback(
    async (data: IProshowCreate) => {
      try {
        setCreating(true);
        setError('');
        const response = await axiosTicketsPrivate.post<IProshowResponse>('/proshows', data);
        await fetchStats();
        await fetchProshows();
        return response.data;
      } catch (err) {
        setError(getErrMsg(err));
        return null;
      } finally {
        setCreating(false);
      }
    },
    [axiosTicketsPrivate, fetchStats, fetchProshows],
  );

  const distributeTickets = useCallback(
    async (proshowId: string) => {
      try {
        setDistributing(true);
        setError('');
        const response = await axiosTicketsPrivate.post<IDistributeResponse>('/distribute', {
          proshow_id: proshowId,
        });

        await fetchStats();
        return response.data;
      } catch (err) {
        setError(getErrMsg(err));
        return null;
      } finally {
        setDistributing(false);
      }
    },
    [axiosTicketsPrivate, fetchStats],
  );

  const values = useMemo(
    () => ({
      stats,
      proshows,
      loading,
      error,
      setError,
      fetchStats,
      fetchProshows,
      createProshow,
      distributeTickets,
      creating,
      distributing,
      statsColumns,
    }),
    [
      stats,
      proshows,
      loading,
      error,
      creating,
      distributing,
      fetchStats,
      fetchProshows,
      createProshow,
      distributeTickets,
    ],
  );

  return values;
}
