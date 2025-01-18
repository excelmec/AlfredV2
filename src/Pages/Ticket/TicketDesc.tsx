import {Box, Typography} from '@mui/material';
import {useContext, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import ToolBar from '../../Components/Tickets/TicketDesc/ToolBar/ToolBar';
import UserContext from 'Contexts/User/UserContext';
import {
    allEventEditRoles,
    allEventViewRoles,
    specificEventViewRoles,
} from 'Hooks/Event/eventRoles';
import {useTicketDesc} from "../../Hooks/Ticket/useTicketDesc";
import TicketData from "../../Components/Tickets/TicketDesc/TIcketData/TicketData";

export default function TicketDescPage() {
    const {ticket, fetchTicket, loading, error, setError} = useTicketDesc();
    const {userData} = useContext(UserContext);

    const {id} = useParams<{ id: string }>();

    useEffect(() => {
        if (!Number.isInteger(Number(id))) {
            setError('Invalid Event ID');
        }

        fetchTicket(Number(id));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        if (loading || !ticket) return;

        if (true) {
            // This person has edit access to all events, so can view all
        } else {
            // This person has no access to any event
            setError('You do not have permission to view this page');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ticket, loading, userData]);

    if (error) {
        return <Typography variant='h5'>{error}</Typography>;
    }

    if (loading) {
        return <Typography variant='h5'>Loading...</Typography>;
    }

    return (
        <>
            <br/>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                }}
            >
                <Typography variant='h5' noWrap>
                    Ticket Details
                </Typography>
            </Box>
            <br/>

            <ToolBar ticketId={ticket!.id}/>
            <TicketData ticket={ticket!}/>
        </>
    );
}
