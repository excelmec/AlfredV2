import { CssBaseline } from '@mui/material';
import 'App.css';
import DashLayout from 'Layout/DashLayout';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UserState from 'Contexts/User/UserState';
import { ApiState } from 'Contexts/Api/ApiState';

import Home from 'Pages/Home';
import Contact from 'Pages/Contact';
import NotFound from 'Pages/NotFound';
import CaListPage from 'Pages/CampusAmbassador/CaList';
import Users from 'Pages/Users';
import EventListPage from 'Pages/EventList';
import EventHeadsPage from 'Pages/EventHeads';
import EventDescPage from 'Pages/EventDesc';
import CaTeamListPage from 'Pages/CampusAmbassador/CaTeamList';
import CaTeamView from 'Pages/CampusAmbassador/CaTeamView';

function App() {
	return (
		<div className='App'>
			<CssBaseline />
			<ApiState>
				<UserState>
					<BrowserRouter>
						<Routes>
							<Route path='/' element={<DashLayout />}>
								<Route path='/' element={<Home />} />
								<Route path='/users' element={<Users />} />
								<Route path='/contact' element={<Contact />} />
								<Route
									path='/ca'
									element={<Navigate to='/ca/list' />}
								/>
								<Route
									path='/ca/list'
									element={<CaListPage />}
								/>
								<Route
									path='/ca/team'
									element={<CaTeamListPage />}
								/>
								<Route
									path='/ca/team/:teamId/view'
									element={<CaTeamView />}
								/>
								<Route
									path='/events'
									element={<EventListPage />}
								/>
								<Route
									path='/events/:id'
									element={<EventDescPage />}
								/>
								<Route
									path='/events/heads'
									element={<EventHeadsPage />}
								/>
								<Route path='*' element={<NotFound />} />
							</Route>
						</Routes>
					</BrowserRouter>
				</UserState>
			</ApiState>
		</div>
	);
}

export default App;
