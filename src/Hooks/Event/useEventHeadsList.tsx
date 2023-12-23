import { useContext, useState } from "react";
import { ApiContext } from "Contexts/Api/ApiContext";
import { getErrMsg } from "Hooks/errorParser";
import {
  GridActionsCellItem,
  GridRowModes,
  GridRowParams,
} from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { TypeSafeColDef } from "Hooks/gridColumType";

export interface IEventHeadsListItem {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  mode?: GridRowModes;
}

export function useEventHeadsList() {
  const [eventHeadsList, setEventHeadsList] = useState<IEventHeadsListItem[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const { axiosEventsPrivate } = useContext(ApiContext);

  async function fetchEventHeadsList() {
    try {
      setLoading(true);
      setError("");

      const response = await axiosEventsPrivate.get<IEventHeadsListItem[]>(
        "/api/eventhead"
      );

      setEventHeadsList(response.data);
    } catch (error) {
      setError(getErrMsg(error));
    } finally {
      setLoading(false);
    }
  }

  const columns: TypeSafeColDef<IEventHeadsListItem>[] = [
    {
      field: "id",
      headerName: "ID",
      type: "number",
      align: "center",
      headerAlign: "center",
      width: 10,
    },
    {
      field: "name",
      headerName: "Name",
      type: "string",
      width: 250,
    },
    {
      field: "email",
      headerName: "Email",
      type: "string",
      width: 250,
      align: "center",
    },
    {
      field: "phoneNumber",
      headerName: "Phone Number",
      type: "string",
      width: 150,
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      width: 150,
      getActions: (params: GridRowParams<IEventHeadsListItem>) => {
        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            color="secondary"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon color="error" />}
            label="Delete"
          />,
        ];
      },
    },
  ];

  return {
    setEventHeadsList,
    eventHeadsList,
    loading,
    error,
    fetchEventHeadsList,
    columns,
  } as const;
}
