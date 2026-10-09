import { useContext, useState, useCallback } from 'react';
import { ApiContext } from 'Contexts/Api/ApiContext';
import { getErrMsg } from 'Hooks/errorParser';

export interface IDistributionResponse {
  success: boolean;
  message: string;
  total_tickets: number;
  batches: number;
}

/** Queues ticket emails for one proshow (`/distribute`) or marathon event (`/marathon/distribute`). */
export function useSendTickets(kind: 'proshow' | 'marathon') {
  const { axiosTicketsPrivate } = useContext(ApiContext);

  const [sending, setSending] = useState<boolean>(false);
  const [sendError, setSendError] = useState<string>('');
  const [sendResult, setSendResult] = useState<IDistributionResponse | null>(null);

  const sendTickets = useCallback(
    async (id: string) => {
      try {
        setSending(true);
        setSendError('');
        setSendResult(null);
        const response =
          kind === 'proshow'
            ? await axiosTicketsPrivate.post<IDistributionResponse>('/distribute', {
                proshow_id: id,
              })
            : await axiosTicketsPrivate.post<IDistributionResponse>('/marathon/distribute', {
                event_id: id,
              });
        setSendResult(response.data);
        return response.data;
      } catch (err) {
        setSendError(getErrMsg(err));
        return null;
      } finally {
        setSending(false);
      }
    },
    [axiosTicketsPrivate, kind],
  );

  const resetSend = useCallback(() => {
    setSendError('');
    setSendResult(null);
  }, []);

  return { sendTickets, sending, sendError, sendResult, resetSend };
}
