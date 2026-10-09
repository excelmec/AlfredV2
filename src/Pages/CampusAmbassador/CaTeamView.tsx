import ManageTeam from 'Components/CampusAmbassador/ManageTeam';
import { PageHeader } from '@/Components/page-header';

export default function CaTeamView() {
  return (
    <>
      <PageHeader title="Team" description="Manage the team name and its ambassadors." />
      <ManageTeam />
    </>
  );
}
