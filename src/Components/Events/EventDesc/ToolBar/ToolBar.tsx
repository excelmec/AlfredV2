import { Box, Button, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import GroupsIcon from '@mui/icons-material/Groups';
import { Link as RouterLink } from 'react-router-dom';

import './ToolBar.css';
import { useNavigate } from 'react-router-dom';

export default function ToolBar({ eventId }: { eventId: number }) {
  const navigate = useNavigate();
  return (
    <Box className="event-desc-toolbar" component={Paper} elevation={2} borderRadius={0} zIndex={5}>
      <Button
        variant="contained"
        color="primary"
        startIcon={<ArrowBackIcon />}
        className="toolbutton"
        onClick={() => {
          navigate('/events');
        }}
      >
        Back
      </Button>
      <Box sx={{ flexGrow: 1 }} />

      <Button
        variant="contained"
        color="primary"
        startIcon={<GroupsIcon />}
        className="toolbutton"
        to={`/events/registrations/view/${eventId}`}
        component={RouterLink}
      >
        Registrations
      </Button>

      <Button
        variant="contained"
        color="primary"
        startIcon={<MilitaryTechIcon />}
        className="toolbutton"
        onClick={() => {
          alert('Coming Soon!');
        }}
      >
        Results
      </Button>
      <Button
        variant="contained"
        color="primary"
        startIcon={<EditIcon />}
        className="toolbutton"
        onClick={() => {
          navigate(`/events/edit/${eventId}`);
        }}
      >
        Edit
      </Button>
    </Box>
  );
}
