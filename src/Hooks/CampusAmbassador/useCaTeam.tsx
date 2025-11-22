import { useContext, useState } from 'react';
import { ApiContext } from 'Contexts/Api/ApiContext';
import { getErrMsg } from 'Hooks/errorParser';
import { CaTeamEvents, CaAccounts, CaTeam } from './useCaTeamList';

import { AxiosResponse } from 'axios';
import { CaListRes } from './useCaList';

export function useCaTeam() {
  const [caTeam, setCaTeam] = useState<CaTeam>({
    name: '',
    id: 0,
    totalBonusPoints: 0,
    totalRefPoints: 0,
    ambassadors: [],
  });
  const [caList, setCaList] = useState<
    (CaAccounts & {
      caTeamId: number | null;
    })[]
  >([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [savingAmbassador, setSavingAmbassador] = useState<boolean>(false);
  const [savingTeamName, setSavingTeamName] = useState<boolean>(false);

  const [removingAmbassador, setRemovingAmbassador] = useState<boolean>(false);

  const [error, setError] = useState<string>('');

  const { axiosEventsPrivate, axiosAccPrivate } = useContext(ApiContext);

  async function fetchCaTeam(teamId: number) {
    try {
      setLoading(true);
      setError('');
      const teamResponse = await axiosEventsPrivate.get<CaTeamEvents>(`/api/cateams/${teamId}`);

      const caListAccountsRes = await axiosAccPrivate.get<CaAccounts[]>('/api/Ambassador/list');

      const CaListEventsResponse =
        await axiosEventsPrivate.get<CaListRes[]>('/api/ambassadors/list');

      const caAccountsMap = new Map<number, CaAccounts>();
      caListAccountsRes.data?.forEach((caAccount) => {
        caAccountsMap.set(caAccount.ambassadorId, caAccount);
      });

      const caListWithTeam = CaListEventsResponse.data?.map((caEvent) => {
        return {
          ...caEvent,
          ...caAccountsMap.get(caEvent.ambassadorId)!,
        };
      });

      setCaList(caListWithTeam);

      setCaTeam({
        ...teamResponse.data,
        ambassadors: teamResponse.data?.ambassadors?.map((ambassador) => {
          return {
            ...ambassador,
            ...caAccountsMap.get(ambassador?.ambassadorId)!,
          };
        }),
      });
    } catch (error) {
      setError(getErrMsg(error));
    } finally {
      setLoading(false);
    }
  }

  async function addAmbassador(teamId: number, ambassadorId: number) {
    try {
      setSavingAmbassador(true);
      await axiosEventsPrivate.post<any, AxiosResponse<CaTeamEvents>>(
        `/api/cateams/add-multiple?teamId=${teamId}`,
        [ambassadorId],
      );

      setSavingAmbassador(false);
      /**
       * Reload Page
       */
      fetchCaTeam(teamId);
    } catch (error) {
      setError(getErrMsg(error));
    } finally {
      setSavingAmbassador(false);
    }
  }

  async function removeAmbassador(teamId: number, ambassadorId: number) {
    try {
      setRemovingAmbassador(true);

      await axiosEventsPrivate.delete<any, AxiosResponse<Boolean>>(
        `/api/cateams/remove/${ambassadorId}`,
      );

      setRemovingAmbassador(false);
      /**
       * Reload Page
       */
      fetchCaTeam(teamId);
    } catch (error) {
      setError(getErrMsg(error));
    } finally {
      setRemovingAmbassador(false);
    }
  }

  async function updateTeamName(teamId: number, teamName: string) {
    try {
      setSavingTeamName(true);
      await axiosEventsPrivate.put<any, AxiosResponse<CaTeamEvents>>(`/api/cateams/edit`, {
        id: teamId,
        name: teamName?.trim(),
      });

      setSavingTeamName(false);
      /**
       * Reload Page
       */
      fetchCaTeam(teamId);
    } catch (error) {
      setError(getErrMsg(error));
    } finally {
      setSavingTeamName(false);
    }
  }

  return {
    caTeam,
    caList,
    loading,
    error,
    fetchCaTeam,

    addAmbassador,
    savingAmbassador,

    updateTeamName,
    savingTeamName,

    removeAmbassador,
    removingAmbassador,
  } as const;
}
