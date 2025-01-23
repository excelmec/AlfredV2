import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  TextField,
} from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridRenderCellParams,
  GridRowParams,
  GridToolbar,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { useContext, useEffect, useState } from "react";
import { IEventListItem, IScheduleItem } from "../../Hooks/Event/eventTypes";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import UserContext from "Contexts/User/UserContext";
import {
  allEventEditRoles,
  allEventViewRoles,
  specificEventViewRoles,
} from "Hooks/Event/eventRoles";
import { TypeSafeColDef } from "Hooks/gridColumType";
import { useScheduleList } from "Hooks/Event/useScheduleList";

function getRowId(row: IScheduleItem) {
  return row.id;
}

export default function EventSchedule() {
  const { userData } = useContext(UserContext);

  const {
    eventList,
    fetchEventList,
    updateScheduleItem,
    loading,
    error,
    setError,
    columns,
    deleteScheduleItem,
  } = useScheduleList();

  const [viewableEvents, setViewableEvents] = useState<IScheduleItem[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<IScheduleItem | null>(
    null
  );
  const [editRound, setEditRound] = useState("");
  const [editRoundId, setEditRoundId] = useState("");

  const navigate = useNavigate();

  const handleEditClick = (params: GridRowParams) => {
    const event = params.row as IScheduleItem;
    setSelectedEvent(event);
    setEditRound(event.round);
    setEditRoundId(event.roundId.toString());
    setEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setSelectedEvent(null);
    setEditRound("");
    setEditRoundId("");
  };

  const handleSaveEdit = async () => {
    if (
      selectedEvent?.round === editRound &&
      selectedEvent?.roundId === Number(editRoundId)
    ) {
      handleCloseModal();
      return;
    }
    await updateScheduleItem(selectedEvent, editRound, Number(editRoundId));
    handleCloseModal();
  };


  const handleDeleteClick = async (params: GridRowParams) => {
    const event = params.row as IScheduleItem;
    await deleteScheduleItem(event.eventId, event.roundId);
  };

  const muiColumns = [
    ...columns,
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      width: 150,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          color="secondary"
          onClick={() => handleEditClick(params)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          color="error"
          onClick={() => handleDeleteClick(params)}
        />,
      ],
    },
  ];

  useEffect(() => {
    fetchEventList();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading) return;
    if (eventList?.length === 0) return;

    if (userData.roles.some((role) => allEventEditRoles.includes(role))) {
      // This person has edit access to all events, so can view all
      setViewableEvents(eventList);
    } else if (
      userData.roles.some((role) => allEventViewRoles.includes(role))
    ) {
      // This person has view access to all events, so can view all
      setViewableEvents(eventList);
    } else {
      // This person has no access to any event
      setViewableEvents([]);
      setError("You do not have permission to view this page");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventList, loading, userData]);

  if (error) {
    return <Typography variant="h5">{error}</Typography>;
  }

  return (
    <>
      <br />
      <Typography variant="h5" noWrap component="div">
        Event Schedule
      </Typography>
      <br />
      <Button
        size="small"
        variant="contained"
        onClick={() => navigate("/events/schedule/create")}
      >
        Create New Schedule
      </Button>
      <br />
      <DataGrid
        density="compact"
        getRowId={getRowId}
        rows={viewableEvents}
        columns={muiColumns}
        loading={loading}
        sx={{
          width: "90%",
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
        showCellVerticalBorder
        showColumnVerticalBorder
      />

      <Dialog open={editModalOpen} onClose={handleCloseModal}>
        <DialogTitle>Edit Schedule Item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Modify the round information for this schedule item.
            {selectedEvent && (
              <Typography
                variant="subtitle1"
                sx={{ my: 1, color: "text.secondary" }}
              >
                Current Event: {selectedEvent.name}
              </Typography>
            )}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Round Text"
            fullWidth
            value={editRound}
            onChange={(e) => setEditRound(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Round ID"
            fullWidth
            value={editRoundId}
            onChange={(e) => setEditRoundId(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
