import { useContext, useState } from 'react';
import { ApiContext } from 'Contexts/Api/ApiContext';
import { getErrMsg } from 'Hooks/errorParser';
import { TypeSafeColDef } from 'Hooks/gridColumType';
import { GridRenderCellParams, GridValueGetterParams } from '@mui/x-data-grid';
import { ITicket, ITicketListItem } from './ticketTypes';

export function useTickets() {
  const [ticketList, setTicketList] = useState<ITicketListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const [ticketIsCheckingIn, setTicketIsCheckingIn] = useState<boolean>(false);

  const { axiosEventsPrivate } = useContext(ApiContext);

  async function fetchTicketList() {
    try {
      setLoading(true);
      setError('');

      const response = await axiosEventsPrivate.get<ITicket[]>('/api/tickets');

      setTicketList(response.data);
    } catch (error) {
      setError(getErrMsg(error));
    } finally {
      setLoading(false);
    }
  }

  async function checkInTicket(excelId: number) {
    try {
      setTicketIsCheckingIn(true);
      setError('');

      const response = await axiosEventsPrivate.post('/api/tickets/' + excelId + '/check-in');

      if (response.status !== 200) {
        setError(response.data);
      }

      await fetchTicketList();
    } catch (error) {
      setError(getErrMsg(error));
    } finally {
      setTicketIsCheckingIn(false);
    }
  }

  const columns: TypeSafeColDef<ITicketListItem>[] = [
    {
      field: 'id',
      headerName: 'ID',
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      width: 10,
    },
    {
      field: 'excelId',
      headerName: 'Excel ID',
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      width: 100,
    },
    {
      field: 'name',
      headerName: 'Name',
      type: 'string',
      width: 150,
    },
    {
      field: 'branchCode',
      headerName: 'Branch Code',
      type: 'string',
      width: 80,
    },
    {
      field: 'branchDivision',
      headerName: 'Branch Division',
      type: 'string',
      width: 80,
    },
    {
      field: 'isPaid',
      headerName: 'Paid',
      type: 'boolean',
      width: 80,
    },
    {
      field: 'mailSent',
      headerName: 'Mail Sent',
      type: 'boolean',
      width: 80,
    },
    {
      field: 'isCheckedIn',
      headerName: 'Checked In',
      type: 'boolean',
      width: 80,
    },
  ];

  return {
    ticketList,
    loading,
    error,
    setError,
    fetchTicketList,
    columns,
    checkInTicket,
    ticketIsCheckingIn,
  } as const;
}
