import { Box, Typography } from '@mui/material';
import ManageTeam from 'Components/CampusAmbassador/ManageTeam';

export default function CaTeamView() {
  return (
    <>
      <Box>
        <Typography variant="h5" noWrap component="div">
          CA Team View
        </Typography>
      </Box>
      <br />
      <ManageTeam />
    </>
  );
}
