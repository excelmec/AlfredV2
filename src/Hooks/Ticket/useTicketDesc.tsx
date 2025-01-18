import {useContext, useState} from 'react';
import {ApiContext} from '../../Contexts/Api/ApiContext';
import {getErrMsg} from '../errorParser';
import {ITicket} from "./ticketTypes";

export function useTicketDesc() {
    const [ticket, setTicket] = useState<ITicket>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    // const {axiosEventsPrivate} = useContext(ApiContext);

    async function fetchTicket(ticketId: number) {
        try {
            setLoading(true);
            setError('');

            // interface IEventResponse extends Omit<IEvent, 'datetime' | 'registrationEndDate'> {
            // 	datetime: string;
            // 	registrationEndDate: string;
            // }
            //
            // const response = await axiosEventsPrivate.get<IEventResponse>(
            // 	`/api/events/${eventId}`
            // );

            const ticketData: ITicket = {
                "id": 2,
                "excelId": 1002,
                "name": "Attendee 2",
                "isPaid": false,
                "amount": 346.79,
                "isCheckedIn": true,
                "branchCode": "EB",
                "branchDivision": "B",
                "entryFee": 900,
                "checkedInBy": {
                    "id": 1,
                    "name": "Admin",
                    "email": "admin@email.com",
                    "phoneNumber": "9876543210",
                }
            };

            setTicket(ticketData);
            return ticketData;
        } catch (error) {
            setError(getErrMsg(error));
        } finally {
            setLoading(false);
        }
    }

    return {ticket, loading, error, fetchTicket, setError} as const;
}
