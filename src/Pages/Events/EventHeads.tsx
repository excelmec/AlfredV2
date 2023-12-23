import { useEffect } from "react";
import { Typography } from "@mui/material";
import ProtectedRoute from "../../Components/Protected/ProtectedRoute";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  IEventHeadsListItem,
  useEventHeadsList,
} from "Hooks/Event/useEventHeadsList";

export default function EventHeadsPage() {
  return (
    <ProtectedRoute>
      <EventHeads />
    </ProtectedRoute>
  );
}

function getRowId(row: IEventHeadsListItem) {
  return row.id;
}

export function EventHeads() {
  const { eventHeadsList, fetchEventHeadsList, error, loading, columns } =
    useEventHeadsList();

  useEffect(() => {
    fetchEventHeadsList();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return <Typography variant="h5">{error}</Typography>;
  }

  return (
    <>
      <Typography variant="h5" noWrap component="div">
        Event Heads List
      </Typography>
      <br />
      <DataGrid
        density="compact"
        getRowId={getRowId}
        rows={eventHeadsList}
        columns={columns}
        editMode="row"
        loading={loading}
        sx={{
          width: "90%",
        }}
        autoPageSize
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        showCellVerticalBorder
        showColumnVerticalBorder
      />
    </>
  );
}
