import { CssBaseline } from '@mui/material';
import './App.css';
import DashLayout from './Layout/DashLayout';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UserState from './Contexts/User/UserState';

import Home from './Pages/Home';
import Contact from './Pages/Contact';
import NotFound from './Pages/NotFound';
import CaList from './Pages/CaList';
import Users from './Pages/Users';

function App() {
	return (
		<div className='App'>
			<CssBaseline />
			<UserState>
				<BrowserRouter>
					<Routes>
						<Route path='/' element={<DashLayout />}>
							<Route path='/' element={<Home />} />
							<Route path='/users' element={<Users />} />
							<Route path='/contact' element={<Contact />} />
							<Route path='/ca' element={<Navigate to='/ca/list' />} />
							<Route path='/ca/list' element={<CaList />} />
							<Route path='*' element={<NotFound />} />
						</Route>
					</Routes>
				</BrowserRouter>
			</UserState>
		</div>
	);
}

export default App;
