import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CaDataView from 'Components/CampusAmbassador/CaData';
import { useCa } from 'Hooks/CampusAmbassador/useCa';
import { PageHeader } from '@/Components/page-header';
import { PageError, PageLoading } from '@/Components/page-state';

export default function CaViewPage() {
  const { ambassadorId } = useParams();
  const {
    ca,
    caPointLog,
    fetchCa,
    loading,
    error,

    addNewPoint,
    savingNewPoint,

    deletePoint,
    deletingPoint,
  } = useCa();

  useEffect(() => {
    fetchCa(Number(ambassadorId));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ambassadorId]);

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError>{error}</PageError>;
  }

  return (
    <>
      <PageHeader title="Campus Ambassador" description="Details and points history." />
      <CaDataView
        ca={ca}
        caPointLog={caPointLog}
        addNewPoint={addNewPoint}
        savingNewPoint={savingNewPoint}
        deletePoint={deletePoint}
        deletingPoint={deletingPoint}
      />
    </>
  );
}
