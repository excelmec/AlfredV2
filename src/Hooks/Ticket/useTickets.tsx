import { useContext, useState, useCallback, useMemo, useRef } from 'react';
import { ApiContext } from 'Contexts/Api/ApiContext';
import { getErrMsg } from 'Hooks/errorParser';
import { ITicketUser } from './ticketTypes';

export function useTickets() {
  const [ticketList, setTicketList] = useState<ITicketUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [rowCount, setRowCount] = useState<number>(0);

  // Cache the discovered total count to prevent "bouncing" pagination
  const totalCountRef = useRef<number | null>(null);
  const prevSearchRef = useRef<string>('');

  const { axiosTicketsPrivate } = useContext(ApiContext);

  const invalidateRowCount = useCallback(() => {
    totalCountRef.current = null;
  }, []);

  const fetchTicketList = useCallback(
    async (offset: number = 0, limit: number = 50, search: string = '') => {
      try {
        setLoading(true);
        setError('');

        // Reset known total if search criteria changes
        if (search !== prevSearchRef.current) {
          totalCountRef.current = null;
          prevSearchRef.current = search;
        }

        const response = await axiosTicketsPrivate.get<ITicketUser[]>('/tickets', {
          params: {
            offset,
            limit,
            search,
          },
        });

        setTicketList(response.data);
        const total = response.headers['x-total-count'];

        if (total) {
          const parsedTotal = parseInt(total, 10);
          setRowCount(parsedTotal);
          totalCountRef.current = parsedTotal;
        } else {
          // Heuristic Pagination Logic
          const currentLen = response.data.length;

          if (currentLen < limit) {
            // We reached the end of the list
            const realTotal = offset + currentLen;
            totalCountRef.current = realTotal;
            setRowCount(realTotal);
          } else {
            // We received a full page
            const projectedMinimum = offset + currentLen;

            // If we have a cached total and we are consistent with it, stick to it.
            // This prevents the "Next" button from re-enabling if we bounce back from an empty page.
            if (totalCountRef.current !== null && totalCountRef.current === projectedMinimum) {
              setRowCount(totalCountRef.current);
            } else {
              // Otherwise, assume there is at least one more item/page
              setRowCount(projectedMinimum + 1);
            }
          }
        }
      } catch (error) {
        setError(getErrMsg(error));
      } finally {
        setLoading(false);
      }
    },
    [axiosTicketsPrivate],
  );

  const values = useMemo(
    () => ({
      ticketList,
      loading,
      error,
      setError,
      fetchTicketList,
      rowCount,
      invalidateRowCount,
    }),
    [ticketList, loading, error, setError, fetchTicketList, rowCount, invalidateRowCount],
  );

  return values;
}
