import { Box, Button, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import GroupsIcon from '@mui/icons-material/Groups';
import { Link as RouterLink } from 'react-router-dom';

import './ToolBar.css';
import { useNavigate } from 'react-router-dom';

export default function ToolBar({ ticketId }: { ticketId: number }) {
  const navigate = useNavigate();
  return (
    <Box
      className="ticket-desc-toolbar"
      component={Paper}
      elevation={2}
      borderRadius={0}
      zIndex={5}
    >
      <Button
        variant="contained"
        color="primary"
        startIcon={<ArrowBackIcon />}
        className="toolbutton"
        onClick={() => {
          navigate('/tickets');
        }}
      >
        Back
      </Button>
      <Box sx={{ flexGrow: 1 }} />

      <Button
        variant="contained"
        color="primary"
        startIcon={<DocumentScannerIcon />}
        className="toolbutton"
        onClick={() => {
          alert('Coming Soon!');
        }}
      >
        Check In
      </Button>
      <Button
        variant="contained"
        color="primary"
        startIcon={<EditIcon />}
        className="toolbutton"
        onClick={() => {
          navigate(`/tickets/edit/${ticketId}`);
        }}
      >
        Edit
      </Button>
    </Box>
  );
}
