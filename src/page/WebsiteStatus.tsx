import { useEffect, useState } from "react";
import Switch from "react-switch";
import { getwithAT, postwithAT } from "../utils/api";

function WebsiteStatus() {
  const [websiteStatus, setWebsiteStatus] = useState(true);
  const [mascotStatus, setMascotStatus] = useState(true);

  useEffect(() => {
    getwithAT("https://launch-api.excelmec.org/launch/status")
      .then((response) => {
        console.log(response.launchStatus);
        setWebsiteStatus(response.launchStatus.websiteStatus);
        setMascotStatus(response.launchStatus.mascotStatus);
      })
      .catch((error) => console.error(error));
  }, []);

  const handleWebsiteStatusChange = (newStatus: boolean) => {
    const data = { websiteStatus: newStatus } as any;

    postwithAT('https://launch-api.excelmec.org/launch/website', data)
      .then(() => {
        
        setWebsiteStatus(newStatus);
      })
      .catch((error) => {
        console.error('Error updating mascot status:', error);
      
      });
  };

  const handleMascotStatusChange = (newStatus: boolean) => {

    const data = { mascotStatus: newStatus } as any;

    postwithAT('https://launch-api.excelmec.org/launch/mascot', data)
      .then(() => {
        
        setMascotStatus(newStatus);
      })
      .catch((error) => {
        console.error('Error updating mascot status:', error);
      
      });
  };

  return (
    <div>
      <h2>Website Status</h2>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span>Off</span>
        <Switch
          onChange={handleWebsiteStatusChange}
          checked={websiteStatus}
          onColor="#86d3ff"
          onHandleColor="#2693e6"
          handleDiameter={30}
          uncheckedIcon={false}
          checkedIcon={false}
          height={20}
          width={48}
        />
        <span>On</span>
      </div>

      <h2>Mascot Status</h2>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span>Off</span>
        <Switch
          onChange={handleMascotStatusChange}
          checked={mascotStatus}
          onColor="#86d3ff"
          onHandleColor="#2693e6"
          handleDiameter={30}
          uncheckedIcon={false}
          checkedIcon={false}
          height={20}
          width={48}
        />
        <span>On</span>
      </div>
    </div>
  );
}

export default WebsiteStatus;
