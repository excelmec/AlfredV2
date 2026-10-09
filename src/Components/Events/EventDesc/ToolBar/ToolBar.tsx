import { Box, Button, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import GroupsIcon from '@mui/icons-material/Groups';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import { Link as RouterLink } from 'react-router-dom';

import './ToolBar.css';
import { useNavigate } from 'react-router-dom';

// Optional: when unset, the link to the forms dashboard is hidden
const formsBaseUrl = import.meta.env.REACT_APP_FORMS_BASE_URL;

export default function ToolBar({
  eventId,
  needVolunteerForm,
}: {
  eventId: number;
  needVolunteerForm?: boolean;
}) {
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

      {needVolunteerForm && formsBaseUrl && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<VolunteerActivismIcon />}
          className="toolbutton"
          href={`${formsBaseUrl}/dashboard/events/new?kind=volunteer&eventId=${eventId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Volunteer Form
        </Button>
      )}

      <Button
        variant="contained"
        color={'primary'}
        startIcon={<MilitaryTechIcon />}
        className="toolbutton"
        onClick={() => {
          navigate(`/events/results/${eventId}`);
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
