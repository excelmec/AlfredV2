import { Typography } from '@mui/material';
import ProtectedRoute from '../Components/Protected/ProtectedRoute';
export default function Home() {
	return (
		<ProtectedRoute>
			<Typography variant='h3' noWrap component='div'>
				About
			</Typography>
		</ProtectedRoute>
	);
}
