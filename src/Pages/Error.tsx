import { Typography } from '@mui/material';

export default function ErrorPage({ errMsg }: { errMsg?: string }) {
  return (
    <>
      <Typography variant="h3" noWrap component="div">
        Oops, That's an error
      </Typography>
      {errMsg && (
        <>
          <br />
          <Typography variant="h5" noWrap component="div">
            {errMsg}
          </Typography>
        </>
      )}
    </>
  );
}
