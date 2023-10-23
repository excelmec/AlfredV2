import { CssBaseline } from '@mui/material';
import './App.css';
import DashLayout from './Layout/DashLayout';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './Pages/Home';

function App() {
	return (
		<div className='App'>
			<CssBaseline />
			<BrowserRouter>
				<Routes>
					<Route path='/' element={<DashLayout />}>
						<Route path='/' element={<Home />} />
						<Route path='/about' element={<h1>About</h1>} />
						<Route path='/contact' element={<h1>Contact</h1>} />
					</Route>
				</Routes>
			</BrowserRouter>
		</div>
	);
}

export default App;
