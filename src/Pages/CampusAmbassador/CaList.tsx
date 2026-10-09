import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon } from '@phosphor-icons/react';
import { CaListRes, useCaList } from 'Hooks/CampusAmbassador/useCaList';
import { TypeSafeColDef } from 'Hooks/gridColumType';
import AddAmbassadors from 'Components/CampusAmbassador/AddAmbassadors';
import { PageHeader } from '@/Components/page-header';
import { PageError } from '@/Components/page-state';
import { DataTable } from '@/Components/data-table/DataTable';
import { RowAction } from '@/Components/data-table/RowAction';

function getRowId(row: CaListRes) {
  return row.ambassadorId;
}

export default function CaListPage() {
  const { caList, fetchCaList, loading, error, addAmbassador } = useCaList();
  const navigate = useNavigate();

  const columns: TypeSafeColDef<CaListRes>[] = [
    { field: 'ambassadorId', headerName: 'Ambassador ID', type: 'string', width: 120 },
    { field: 'name', headerName: 'Name', type: 'string', minWidth: 150 },
    { field: 'code', headerName: 'Referral Code', type: 'string', width: 130 },
    { field: 'college', headerName: 'College', type: 'string', minWidth: 150 },
    { field: 'referralPoints', headerName: 'Referral Pts', type: 'number', width: 100 },
    { field: 'bonusPoints', headerName: 'Bonus Pts', type: 'number', width: 100 },
    { field: 'totalPoints', headerName: 'Total Pts', type: 'number', width: 100 },
    { field: 'caTeamId', headerName: 'Team ID', type: 'number', width: 90 },
    { field: 'email', headerName: 'Email ID', type: 'string', minWidth: 220 },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 80,
      getActions: (params) => [
        <RowAction
          key="view"
          icon={<EyeIcon />}
          label="View"
          tone="primary"
          onClick={() => navigate(`/ca/${params.row.ambassadorId}`)}
        />,
      ],
    },
  ];

  useEffect(() => {
    fetchCaList();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return <PageError>{error}</PageError>;
  }

  return (
    <>
      <PageHeader
        title="Campus Ambassadors"
        description="Everyone enrolled in the campus ambassador programme."
        actions={
          <AddAmbassadors caList={caList} addAmbassador={addAmbassador} onAdded={fetchCaList} />
        }
      />
      <DataTable
        columns={columns}
        rows={caList}
        getRowId={getRowId}
        loading={loading}
        exportFileName="campus-ambassadors"
        searchPlaceholder="Search ambassadors..."
      />
    </>
  );
}
