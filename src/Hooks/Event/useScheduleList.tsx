import { useContext, useState } from "react";
import { ApiContext } from "Contexts/Api/ApiContext";
import { getErrMsg } from "Hooks/errorParser";
import { IScheduleItem } from "./eventTypes";
import { TypeSafeColDef } from "Hooks/gridColumType";
import { GridRenderCellParams, GridValueGetterParams } from "@mui/x-data-grid";

export function useScheduleList() {
  const [eventList, setEventList] = useState<IScheduleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [eventIsDeleting, setEventIsDeleting] = useState<boolean>(false);

  const { axiosEventsPrivate } = useContext(ApiContext);

  async function fetchEventList() {
    try {
      setLoading(true);
      setError("");

      interface IScheduleResponse {
        day: number;
        events: Array<{
          id: number;
          name: string;
          icon: string;
          eventType: string;
          category: string;
          venue: string;
          needRegistration: boolean;
          roundId: number;
          round: string;
          day: number;
          datetime: string;
        }>;
      }

      const response = await axiosEventsPrivate.get<IScheduleResponse[]>(
        "/api/schedule"
      );

      let eventListData: IScheduleItem[] = response.data
        .flatMap((daySchedule) => daySchedule.events)
        .map((event, index) => ({
          ...event,
          datetime: new Date(event.datetime),
          id: index + 1,
          eventId: event.id,
        }));

      setEventList(eventListData);
    } catch (error) {
      setError(getErrMsg(error));
    } finally {
      setLoading(false);
    }
  }

  async function deleteEvent(eventId: number, eventName: string) {
    try {
      setEventIsDeleting(true);
      setError("");

      await axiosEventsPrivate.delete(`/api/events/`, {
        data: {
          id: eventId,
          name: eventName,
        },
      });

      await fetchEventList();
    } catch (error) {
      setError(getErrMsg(error));
    } finally {
      setEventIsDeleting(false);
    }
  }

  const columns: TypeSafeColDef<IScheduleItem>[] = [
    {
      field: "id",
      headerName: "ID",
      type: "number",
      align: "center",
      headerAlign: "center",
      width: 10,
    },
    {
      field: "eventId",
      headerName: "Event ID",
      type: "number",
      align: "center",
      headerAlign: "center",
      width: 100,
    },
    {
      field: "name",
      headerName: "Name",
      type: "string",
      width: 200,
    },
    {
      field: "eventType",
      headerName: "Event Type",
      type: "string",
      width: 100,
    },
    {
      field: "roundId",
      headerName: "RoundId",
      type: "number",
      width: 80,
    },
    {
      field: "round",
      headerName: "Round",
      type: "string",
      width: 200,
    },
    {
      field: "day",
      headerName: "Day",
      type: "number",
      width: 10,
      align: "center",
    },
    {
      field: "datetime",
      headerName: "DateTime",
      type: "string",
      width: 150,
      valueGetter: (params: GridValueGetterParams<IScheduleItem>) => {
        return params.row.datetime.toLocaleString([], {
          year: "2-digit",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        });
      },
    },
  ];

  const updateScheduleItem = async (
    selectedEvent: IScheduleItem | null,
    round: string,
    roundId: number
  ) => {
    try {
      setError("");
      await axiosEventsPrivate.put(`/api/schedule`, {
        eventId: selectedEvent?.eventId,
        round,
        roundId,
        day: selectedEvent?.day,
        datetime: selectedEvent?.datetime,
      });

      setEventList((prevList) =>
        prevList.map((event) =>
          event.eventId === selectedEvent?.eventId
            ? { ...event, round, roundId }
            : event
        )
      );
    } catch (error) {
      setError(getErrMsg(error));
      throw error;
    }
  };

  return {
    eventList,
    loading,
    error,
    setError,
    fetchEventList,
    columns,
    deleteEvent,
    eventIsDeleting,
    updateScheduleItem,
  } as const;
}
