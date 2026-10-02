import { useContext, useState } from 'react';
import { ApiContext } from 'Contexts/Api/ApiContext';
import { getErrMsg } from 'Hooks/errorParser';
import { NewAmbassador } from './parseCaCsv';

export interface CAEvents {
  ambassadorId: number;
  caTeamId: number | null;
  referralPoints: number;
  bonusPoints: number;
  totalPoints: number;
}

export interface CaListRes extends CAEvents {
  email: string;
  image: string;
  name: string;
  code?: string;
  college?: string | null;
}

export function useCaList() {
  const [caList, setCaList] = useState<CaListRes[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const { axiosEventsPrivate } = useContext(ApiContext);
  async function fetchCaList() {
    try {
      setLoading(true);
      setError('');
      const response = await axiosEventsPrivate.get<CaListRes[]>('/api/ambassadors/list');

      setCaList(response.data);
    } catch (error) {
      setError(getErrMsg(error));
    } finally {
      setLoading(false);
    }
  }

  /** Creates an ambassador with the given referral code. Throws on failure. */
  async function addAmbassador(ambassador: NewAmbassador) {
    const response = await axiosEventsPrivate.post<CaListRes>('/api/ambassadors/add-with-code', {
      name: ambassador.name,
      college: ambassador.college || null,
      email: ambassador.email || null,
      phone: ambassador.phone || null,
      code: ambassador.code,
    });
    return response.data;
  }

  return { caList, loading, error, fetchCaList, addAmbassador } as const;
}
