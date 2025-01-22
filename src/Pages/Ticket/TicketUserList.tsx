import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Typography,
} from '@mui/material';
import {
    DataGrid,
    GridActionsCellItem,
    GridRowParams,
    GridToolbar,
} from '@mui/x-data-grid';
import {useContext, useEffect, useState} from 'react';
import {IEventListItem} from '../../Hooks/Event/eventTypes';
import {useNavigate} from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import UserContext from 'Contexts/User/UserContext';
import {
    allEventEditRoles,
    allEventViewRoles,
    specificEventViewRoles,
} from 'Hooks/Event/eventRoles';
import {useTickets} from "../../Hooks/Ticket/useTickets";
import {ITicketListItem} from "../../Hooks/Ticket/ticketTypes";

function getRowId(row: IEventListItem) {
    return row.id;
}

export default function TicketUserList() {
    const {userData} = useContext(UserContext);

    const {
        ticketList,
        loading,
        error,
        setError,
        fetchTicketList,
        columns,
        checkInTicket,
        ticketIsCheckingIn
    } = useTickets()

    const [viewableTickets, setViewableTickets] = useState<ITicketListItem[]>([]);

    const navigate = useNavigate();
    const [checkInOpen, setCheckInOpen] = useState<boolean>(false);
    const [ticketToCheckIn, setTicketToCheckIn] = useState<
        Pick<ITicketListItem, 'id' | 'name' | 'excelId'> | undefined
    >();

    const muiColumns = [
        ...columns,
        {
            field: 'actions',
            headerName: 'Actions',
            type: 'actions',
            width: 150,
            getActions: (params: GridRowParams) => [
                <GridActionsCellItem
                    icon={<VisibilityIcon color='primary'/>}
                    label='View'
                    onClick={() => {
                        navigate(`/tickets/view/${params.row.id}`);
                    }}
                />,
                <GridActionsCellItem
                    icon={<CreditScoreIcon />}
                    label='Mark as Paid'
                    color='primary'
                    onClick={() => {
                        // setTicketToCheckIn(params.row as ITicketListItem);
                        // confirmCheckIn();
                    }}
                />,
                <GridActionsCellItem
                    icon={<DocumentScannerIcon/>}
                    label='CheckIn'
                    color='primary'
                    onClick={() => {
                        setTicketToCheckIn(params.row as ITicketListItem);
                        confirmCheckIn();
                    }}
                />,
                <GridActionsCellItem
                    icon={<EditIcon/>}
                    label='Edit'
                    color='secondary'
                    onClick={() => {
                        navigate(`/tickets/edit/${params.row.id}`);
                    }}
                />,
            ],
        },
    ];

    function confirmCheckIn() {
        if (userData.roles.some((role) => allEventEditRoles.includes(role))) {
            setCheckInOpen(true);
        } else {
            alert('You do not have permission to perform this action.');
        }
    }

    async function handleCheckIn(ticketId: number) {
        await checkInTicket(ticketId);
        handleCheckInClose();
    }

    const handleCheckInClose = () => {
        if (ticketIsCheckingIn) {
            return;
        }
        setCheckInOpen(false);
    };

    useEffect(() => {
        fetchTicketList();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (loading) return;
        if (ticketList?.length === 0) return;

        if (true) {
            setViewableTickets(ticketList)
        } else {
            // This person has no access to any event
            setViewableTickets([]);
            setError('You do not have permission to view this page');
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ticketList, loading, userData]);

    if (error) {
        return <Typography variant='h5'>{error}</Typography>;
    }

    return (
        <>
            <br/>
            <Typography variant='h5' noWrap component='div'>
                User List
            </Typography>
            <br/>
            <br/>
            <DataGrid
                density='compact'
                getRowId={getRowId}
                rows={viewableTickets}
                columns={muiColumns}
                loading={loading}
                sx={{
                    width: '90%',
                }}
                autoPageSize
                slots={{toolbar: GridToolbar}}
                slotProps={{
                    toolbar: {
                        showQuickFilter: true,
                        printOptions: {
                            hideFooter: true,
                            hideHeader: true,
                            hideToolbar: true,
                        }
                    },
                }}
                showCellVerticalBorder
                showColumnVerticalBorder
            />

            <Dialog open={checkInOpen} onClose={handleCheckInClose}>
                <DialogTitle>
                    Check In Ticket with Excel ID: {ticketToCheckIn?.excelId}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Would you like to check in: {ticketToCheckIn?.name}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        autoFocus
                        onClick={() => {
                            handleCheckIn(
                                ticketToCheckIn?.excelId as number,
                            );
                        }}
                        disabled={ticketIsCheckingIn}
                    >
                        Check In
                    </Button>
                    <Button
                        onClick={handleCheckInClose}
                        autoFocus
                        disabled={ticketIsCheckingIn}
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
