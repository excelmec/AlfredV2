import { useContext, useState } from 'react';
import { ApiContext } from 'Contexts/Api/ApiContext';
import { getErrMsg } from 'Hooks/errorParser';
import { CaListRes } from './useCaList';

export interface CaPointLog {
  id: number;
  ambassadorId: number;
  pointAwarded: number;
  description: string;
  dateTime: string;
}

export interface CaData extends CaListRes {
  teamName: string;
}

export function useCa() {
  const [ca, setCa] = useState<CaData>({
    name: '',
    ambassadorId: 0,
    bonusPoints: 0,
    referralPoints: 0,
    caTeamId: 0,
    totalPoints: 0,
    email: '',
    image: '',
    teamName: '',
  });
  const [caPointLog, setCaPointLog] = useState<CaPointLog[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const [savingNewPoint, setSavingNewPoint] = useState<boolean>(false);
  const [deletingPoint, setDeletingPoint] = useState<boolean>(false);

  const { axiosEventsPrivate } = useContext(ApiContext);

  async function fetchCa(ambassadorId: number) {
    try {
      setLoading(true);
      setError('');
      const caResponse = await axiosEventsPrivate.get<CaListRes>(
        `/api/ambassadors/${ambassadorId}`,
      );

      const pointLog = await axiosEventsPrivate.get<CaPointLog[]>(`/api/pointlogs/${ambassadorId}`);
      setCaPointLog(pointLog.data);

      if (caResponse.data.caTeamId) {
        const teamResponse = await axiosEventsPrivate.get<{
          id: number;
          name: string;
        }>(`/api/cateams/${caResponse.data.caTeamId}`);

        setCa({
          ...caResponse.data,
          teamName: teamResponse.data.name,
        });
      } else {
        setCa({
          ...caResponse.data,
          teamName: 'Not Assigned',
        });
      }
    } catch (error) {
      setError(getErrMsg(error));
    } finally {
      setLoading(false);
    }
  }

  async function addNewPoint(point: Omit<CaPointLog, 'id'>) {
    try {
      setSavingNewPoint(true);

      await axiosEventsPrivate.post<CaPointLog>(`/api/pointlogs/add`, {
        ambassadorId: point.ambassadorId,
        pointAwarded: point.pointAwarded,
        dateTime: point.dateTime,
        description: point.description,
      });
      setSavingNewPoint(false);
      fetchCa(point.ambassadorId);
    } catch (err) {
      setError(getErrMsg(err));
    } finally {
      setSavingNewPoint(false);
    }
  }

  async function deletePoint(pointId: number) {
    try {
      setDeletingPoint(true);

      await axiosEventsPrivate.delete<CaPointLog>(`/api/pointlogs/delete/${pointId}`);
      setDeletingPoint(false);
      fetchCa(ca.ambassadorId);
    } catch (error) {
      setError(getErrMsg(error));
    } finally {
      setDeletingPoint(false);
    }
  }

  return {
    ca,
    caPointLog,
    loading,
    error,
    fetchCa,

    addNewPoint,
    savingNewPoint,

    deletePoint,
    deletingPoint,
  } as const;
}
