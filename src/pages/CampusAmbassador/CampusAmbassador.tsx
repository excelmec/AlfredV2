import SideNav from "../../common/SideNav/SideNav"
import TopNav from "../../common/TopNav/TopNav"
import './CampusAmbassador.css'

const CampusAmbassador = () => {
  return (
    <div>
        <TopNav/>
        <div className="campusAmbassador">
        <SideNav/>
        <div className="campusContent">
            <h2>Campus Ambassador</h2>
        </div>
        </div>
    </div>
  )
}

export default CampusAmbassador