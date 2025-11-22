import { Grid, Box, Typography, Paper, Divider } from '@mui/material';
import { ITicket } from '../../../../Hooks/Ticket/ticketTypes';

import './TicketData.css';

export default function TicketData({ ticket }: { ticket: ITicket }) {
  return (
    <Box className="ticket-data-container" component={Paper} elevation={1} borderRadius={0}>
      <Grid
        container
        spacing={2}
        justifyContent="center"
        alignItems="center"
        className="ticket-data-grid"
      >
        <Grid item xs={12}>
          <Typography variant="h5">Ticket Details</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography>ID</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography>{ticket.id}</Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography>Excel ID</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography>{ticket.excelId}</Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography>Name</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography>{ticket?.name}</Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography>Branch</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography>{ticket?.branchCode}</Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography>Division</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography>{ticket?.branchDivision}</Typography>
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5">Ticket Fee</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography>Entry Fee</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography>{ticket?.amount}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography>Paid</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography>{ticket?.isPaid ? 'Paid' : 'Not Paid'}</Typography>
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5">Ticket Check In Details</Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography>Checked In</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography>{ticket?.checkedIn ? 'Checked In' : 'Not Checked In'}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography>{ticket?.isPaid ? 'Paid' : 'Not Paid'}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography>{ticket?.checkedInBy}</Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
