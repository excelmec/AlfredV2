import { Typography } from "@mui/material";
import ProtectedRoute from "../Components/Protected/ProtectedRoute";

export default function EventHeadsPage() {
	return (
		<ProtectedRoute>
			<EventHeads />
		</ProtectedRoute>
	);
}

export function EventHeads() {

	return (
		<>
			<Typography variant='h5' noWrap component='div'>
				Event Heads List
			</Typography>
		</>
	);
}
