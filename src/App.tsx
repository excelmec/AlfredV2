import { CssBaseline } from '@mui/material';
import './App.css';
import DashLayout from './Layout/DashLayout';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UserState from './Contexts/User/UserState';
import { ApiState } from './Contexts/Api/ApiState';

import Home from './Pages/Home';
import Contact from './Pages/Contact';
import NotFound from './Pages/NotFound';
import CaListPage from './Pages/CaList';
import Users from './Pages/Users';
import EventListPage from './Pages/EventList';

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
									path='/event'
									element={<Navigate to='/event/list' />}
								/>
								<Route
									path='/event/list'
									element={<EventListPage />}
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
