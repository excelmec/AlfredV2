import { useContext, useState } from 'react';
import { ApiContext } from 'Contexts/Api/ApiContext';
import { getErrMsg } from 'Hooks/errorParser';
import { CAEvents } from './useCaList';

import { TypeSafeColDef } from 'Hooks/gridColumType';
import { GridValueGetterParams } from '@mui/x-data-grid';

export interface CaAccounts {
  ambassadorId: number;
  name: string;
  email: string;
  image: string;
}

export interface CaTeamEvents {
  id: number;
  name: string;
  totalBonusPoints: number;
  totalRefPoints: number;
  ambassadors: CAEvents[];
}

export interface CaTeam extends CaTeamEvents {
  ambassadors: (CaAccounts & CAEvents)[];
}

export function useCaTeamList() {
  const [caTeamList, setCaTeamList] = useState<
    (
      | CaTeam
      | {
          ambassadors: CaAccounts[];
        }
    )[]
  >([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [teamDeleting, setTeamDeleting] = useState<boolean>(false);
  const [teamCreating, setTeamCreating] = useState<boolean>(false);

  const { axiosEventsPrivate, axiosAccPrivate } = useContext(ApiContext);
  async function fetchCaTeamList() {
    try {
      setLoading(true);
      setError('');
      const response = await axiosEventsPrivate.get<CaTeam[]>('/api/cateams/list');

      const caListAccountsRes = await axiosAccPrivate.get<CaAccounts[]>('/api/Ambassador/list');

      const caAccountsMap = new Map<number, CaAccounts>();
      caListAccountsRes.data?.forEach((caAccount) => {
        caAccountsMap.set(caAccount.ambassadorId, caAccount);
      });
      const caTeamList = response.data.map((caTeam) => {
        return {
          ...caTeam,
          ambassadors: caTeam.ambassadors?.map((ambassador) => {
            return {
              ...ambassador,
              ...caAccountsMap.get(ambassador?.ambassadorId),
            };
          }),
        };
      });

      setCaTeamList(caTeamList);
    } catch (error) {
      setError(getErrMsg(error));
    } finally {
      setLoading(false);
    }
  }

  async function deleteCaTeam(teamId: number) {
    try {
      setTeamDeleting(true);
      await axiosEventsPrivate.delete(`/api/cateams/delete/${teamId}`);

      setTeamDeleting(false);
      fetchCaTeamList();
    } catch (error) {
      setError(getErrMsg(error));
    } finally {
      setLoading(false);
    }
  }

  async function createCaTeam(teamName: string) {
    try {
      setTeamCreating(true);
      await axiosEventsPrivate.post('/api/cateams/create', {
        name: teamName,
        ambassadorIds: [],
      });

      fetchCaTeamList();
    } catch (error) {
      setError(getErrMsg(error));
    } finally {
      setTeamCreating(false);
    }
  }

  const columns: TypeSafeColDef<CaTeam>[] = [
    {
      field: 'id',
      headerName: 'Team ID',
      type: 'number',
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'name',
      headerName: 'Name',
      type: 'string',
    },
    {
      field: 'totalBonusPoints',
      headerName: 'Bonus Points',
      type: 'number',
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'totalRefPoints',
      headerName: 'Referal Points',
      type: 'number',
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'ambassadors',
      headerName: 'Ambassadors',
      type: 'string',
      valueGetter: (params: GridValueGetterParams<CaTeam>) => {
        return params.row.ambassadors
          ?.map((ambassador) => {
            return ambassador?.name;
          })
          .join(', ');
      },
      flex: 1,
    },
  ];

  return {
    caTeamList,
    loading,
    error,
    fetchCaTeamList,
    columns,
    deleteCaTeam,
    teamDeleting,
    createCaTeam,
    teamCreating,
  } as const;
}
