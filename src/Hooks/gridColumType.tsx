import { GridColDef } from "@mui/x-data-grid";

export type TypeSafeColDef<T> = GridColDef & { field: keyof T };