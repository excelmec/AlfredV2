import './App.css'
import Login from './page/Login'
import CampusAmbassador from './pages/CampusAmbassador/CampusAmbassador'

function App() {
 

  return (
    <>
    {localStorage.getItem('refreshToken') ? <CampusAmbassador /> : <Login />}
    </>
  )
}

export default App
