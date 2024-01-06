import { CssBaseline } from '@mui/material';
import 'App.css';
import DashLayout from 'Layout/DashLayout';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UserState from 'Contexts/User/UserState';
import { ApiState, merchBaseUrl } from 'Contexts/Api/ApiState';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import Home from 'Pages/Home';
import Contact from 'Pages/Contact';
import NotFound from 'Pages/NotFound';
import CaListPage from 'Pages/CampusAmbassador/CaList';
import UserListPage from 'Pages/Users';
import EventListPage from 'Pages/Events/EventList';
import EventHeadsPage from 'Pages/Events/EventHeads';
import EventDescPage from 'Pages/Events/EventDesc';
import CaTeamListPage from 'Pages/CampusAmbassador/CaTeamList';
import CaTeamView from 'Pages/CampusAmbassador/CaTeamView';
import CaViewPage from 'Pages/CampusAmbassador/CaView';
import ProtectedRoute from 'Components/Protected/ProtectedRoute';
import EventEditPage from 'Pages/Events/EventEdit';
import EventCreatePage from 'Pages/Events/EventCreate';
import ErrorPage from 'Pages/Error';
import MerchItemListPage from 'Pages/Merchandise/ItemList';
import MerchItemViewPage from 'Pages/Merchandise/itemView';
import MerchItemEditPage from 'Pages/Merchandise/itemEdit';
import MerchItemCreatePage from 'Pages/Merchandise/itemCreate';

function App() {
	return (
		<div className='App'>
			<CssBaseline />
			<ApiState>
				<UserState>
					<LocalizationProvider dateAdapter={AdapterDayjs}>
						<BrowserRouter>
							<Routes>
								<Route path='/' element={<DashLayout />}>
									<Route path='/' element={<Home />} />

									{UserRoutes().map((route) => route)}

									{ContactRoutes().map((route) => route)}

									{CampusAmbassadorRoutes().map(
										(route) => route
									)}

									{EventsRoutes().map((route) => route)}

									{MerchRoutes().map((route) => route)}

									<Route path='*' element={<NotFound />} />
								</Route>
							</Routes>
						</BrowserRouter>
					</LocalizationProvider>
				</UserState>
			</ApiState>
		</div>
	);
}

function UserRoutes() {
	return [
		<Route
			path='/users'
			element={
				<ProtectedRoute allowedRoles={['Admin', 'CaVolunteer']}>
					<UserListPage />
				</ProtectedRoute>
			}
		/>,
	];
}

function CampusAmbassadorRoutes() {
	return [
		<Route path='/ca' element={<Navigate to='/ca/list' />} />,
		<Route
			path='/ca/:ambassadorId'
			element={
				<ProtectedRoute allowedRoles={['Admin', 'CaVolunteer']}>
					<CaViewPage />
				</ProtectedRoute>
			}
		/>,
		<Route
			path='/ca/list'
			element={
				<ProtectedRoute allowedRoles={['Admin', 'CaVolunteer']}>
					<CaListPage />
				</ProtectedRoute>
			}
		/>,
		<Route
			path='/ca/team'
			element={
				<ProtectedRoute allowedRoles={['Admin', 'CaVolunteer']}>
					<CaTeamListPage />
				</ProtectedRoute>
			}
		/>,
		<Route
			path='/ca/team/:teamId/view'
			element={
				<ProtectedRoute allowedRoles={['Admin', 'CaVolunteer']}>
					<CaTeamView />
				</ProtectedRoute>
			}
		/>,
	];
}

function EventsRoutes() {
	return [
		<Route
			path='/events'
			element={
				<ProtectedRoute allowedRoles={['Admin']}>
					<EventListPage />
				</ProtectedRoute>
			}
		/>,
		<Route
			path='/events/view/:id'
			element={
				<ProtectedRoute allowedRoles={['Admin']}>
					<EventDescPage />
				</ProtectedRoute>
			}
		/>,
		<Route
			path='/events/edit/:id'
			element={
				<ProtectedRoute allowedRoles={['Admin']}>
					<EventEditPage />
				</ProtectedRoute>
			}
		/>,
		<Route
			path='/events/create'
			element={
				<ProtectedRoute allowedRoles={['Admin']}>
					<EventCreatePage />
				</ProtectedRoute>
			}
		/>,
		<Route
			path='/events/heads'
			element={
				<ProtectedRoute allowedRoles={['Admin']}>
					<EventHeadsPage />
				</ProtectedRoute>
			}
		/>,
		<Route
			path='/events/heads/create'
			element={
				<ProtectedRoute allowedRoles={['Admin']}>
					<EventHeadsPage />
				</ProtectedRoute>
			}
		/>,
	];
}

function MerchRoutes() {
	if (!merchBaseUrl)
		return [
			<Route
				path='/merch/*'
				element={
					<ProtectedRoute allowedRoles={['Admin', 'MerchManage']}>
						<ErrorPage errMsg='Merch Features are disabled as merch backend url is not set' />
					</ProtectedRoute>
				}
			/>,
		];

	return [
		<Route
			path='/merch/items'
			element={
				<ProtectedRoute allowedRoles={['Admin', 'MerchManage']}>
					<MerchItemListPage />
				</ProtectedRoute>
			}
		/>,
		<Route
			path='/merch/items/create'
			element={
				<ProtectedRoute allowedRoles={['Admin', 'MerchManage']}>
					<MerchItemCreatePage />
				</ProtectedRoute>
			}
		/>,
		<Route
			path='/merch/items/view/:itemId'
			element={
				<ProtectedRoute allowedRoles={['Admin', 'MerchManage']}>
					<MerchItemViewPage />
				</ProtectedRoute>
			}
		/>,
		<Route
			path='/merch/items/edit/:itemId'
			element={
				<ProtectedRoute allowedRoles={['Admin', 'MerchManage']}>
					<MerchItemEditPage />
				</ProtectedRoute>
			}
		/>,
	];
}

function ContactRoutes() {
	return [
		<Route
			path='/contact'
			element={
				<ProtectedRoute>
					<Contact />
				</ProtectedRoute>
			}
		/>,
	];
}

export default App;
