import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  HandHeartIcon,
  MedalIcon,
  PencilSimpleIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react';
import { Button } from '@/Components/ui/button';

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
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" onClick={() => navigate('/events')}>
        <ArrowLeftIcon /> Back
      </Button>
      <div className="flex-1" />

      <Button variant="outline" asChild>
        <Link to={`/events/registrations/view/${eventId}`}>
          <UsersThreeIcon /> Registrations
        </Link>
      </Button>

      {needVolunteerForm && formsBaseUrl && (
        <Button variant="outline" asChild>
          <a
            href={`${formsBaseUrl}/dashboard/events/new?kind=volunteer&eventId=${eventId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <HandHeartIcon /> Volunteer form
          </a>
        </Button>
      )}

      <Button variant="outline" onClick={() => navigate(`/events/results/${eventId}`)}>
        <MedalIcon /> Results
      </Button>
      <Button onClick={() => navigate(`/events/edit/${eventId}`)}>
        <PencilSimpleIcon /> Edit
      </Button>
    </div>
  );
}
