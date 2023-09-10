import './SideNav.css'
import {BsPeopleFill} from 'react-icons/bs'
import {AiTwotoneHome} from 'react-icons/ai'
import {FiUsers} from 'react-icons/fi'

const SideNav = () => {
  return (
    <div className='sideNav'>
        <ul>
            <li><AiTwotoneHome/>&nbsp;Home</li>
            <li><BsPeopleFill color="black" className="caIcon"/>&nbsp;Campus Ambassador</li>
            <li><FiUsers/>&nbsp;Users</li>
        </ul>
    </div>
  )
}

export default SideNav