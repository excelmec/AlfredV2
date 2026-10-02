import { Typography } from '@mui/material';
import { DataGrid, GridActionsCellItem, GridRowParams, GridToolbar } from '@mui/x-data-grid';
import { useEffect } from 'react';
import { CaListRes, useCaList } from 'Hooks/CampusAmbassador/useCaList';
import { TypeSafeColDef } from 'Hooks/gridColumType';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import AddAmbassadors from 'Components/CampusAmbassador/AddAmbassadors';

function getRowId(row: CaListRes) {
  return row.ambassadorId;
}

export default function CaListPage() {
  const { caList, fetchCaList, loading, error, addAmbassador } = useCaList();
  const navigate = useNavigate();

  const columns: TypeSafeColDef<CaListRes>[] = [
    {
      field: 'ambassadorId',
      headerName: 'Ambassador ID',
      type: 'string',
      width: 120,
    },
    {
      field: 'name',
      headerName: 'Name',
      type: 'string',
      minWidth: 150,
      flex: 0.7,
    },
    {
      field: 'code',
      headerName: 'Referral Code',
      type: 'string',
      width: 130,
    },
    {
      field: 'college',
      headerName: 'College',
      type: 'string',
      minWidth: 150,
      flex: 0.7,
    },
    {
      field: 'referralPoints',
      headerName: 'Referal Pts',
      type: 'number',
      width: 100,
    },
    {
      field: 'bonusPoints',
      headerName: 'Bonus Pts',
      type: 'number',
      width: 100,
    },
    {
      field: 'totalPoints',
      headerName: 'Total Pts',
      type: 'number',
      width: 100,
    },
    {
      field: 'caTeamId',
      headerName: 'Team ID',
      type: 'number',
      width: 150,
    },
    {
      field: 'email',
      headerName: 'Email ID',
      type: 'string',
      minWidth: 250,
      flex: 0.7,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 150,
      getActions: (params: GridRowParams<CaListRes>) => [
        <GridActionsCellItem
          icon={<VisibilityIcon color="primary" />}
          label="View"
          onClick={() => {
            navigate(`/ca/${params.row.ambassadorId}`);
          }}
        />,
      ],
    },
  ];

  useEffect(() => {
    fetchCaList();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return <Typography variant="h5">{error}</Typography>;
  }

  return (
    <>
      <br />
      <Typography variant="h5" noWrap component="div">
        Campus Ambassadors List
      </Typography>
      <br />
      <AddAmbassadors caList={caList} addAmbassador={addAmbassador} onAdded={fetchCaList} />
      <br />
      <DataGrid
        density="compact"
        getRowId={getRowId}
        rows={caList}
        columns={columns}
        loading={loading}
        sx={{
          width: '90%',
        }}
        autoPageSize
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            printOptions: {
              hideFooter: true,
              hideHeader: true,
              hideToolbar: true,
            },
          },
        }}
      />
    </>
  );
}
