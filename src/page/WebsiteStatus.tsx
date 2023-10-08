import { useEffect, useState } from 'react';
import Switch from 'react-switch';
import { getwithAT, postwithAT } from '../utils/api';
import './WebsiteStatus.css';

function WebsiteStatus() {

  const mascotPageUrl = 'https://mascot.excelmec.org';
  const websitePageUrl = 'https://excelmec.org';

	const [websiteStatus, setWebsiteStatus] = useState<boolean | null>(null);
	const [mascotStatus, setMascotStatus] = useState<boolean | null>(null);

	const [websiteStatusLoading, setWebsiteStatusLoading] =
		useState<boolean>(true);
	const [mascotStatusLoading, setMascotStatusLoading] =
		useState<boolean>(true);

	useEffect(() => {
		setMascotStatusLoading(true);
		setWebsiteStatusLoading(true);
		getwithAT('https://launch-api.excelmec.org/launch/status')
			.then((response) => {
				console.log(response.launchStatus);
				setWebsiteStatus(response.launchStatus.websiteStatus);
				setMascotStatus(response.launchStatus.mascotStatus);
				setMascotStatusLoading(false);
				setWebsiteStatusLoading(false);
			})
			.catch((error) => {
				console.error(error);
				alert('Error fetching status');
			})
			.finally(() => {
				setMascotStatusLoading(false);
				setWebsiteStatusLoading(false);
			});
	}, []);

	const handleWebsiteStatusChange = (newStatus: boolean) => {
		const data = { websiteStatus: newStatus } as any;
		setWebsiteStatusLoading(true);
		postwithAT('https://launch-api.excelmec.org/launch/website', data)
			.then(() => {
				setWebsiteStatus(newStatus);
				setWebsiteStatusLoading(false);

        if (newStatus) {
          window.open(websitePageUrl, '_blank');
        }
			})
			.catch((error) => {
				console.error('Error updating website status:', error);
				alert('Error updating website status');
			})
			.finally(() => {
				setWebsiteStatusLoading(false);
			});
	};

	const handleMascotStatusChange = (newStatus: boolean) => {
		const data = { mascotStatus: newStatus } as any;
		setMascotStatusLoading(true);
		postwithAT('https://launch-api.excelmec.org/launch/mascot', data)
			.then(() => {
				setMascotStatus(newStatus);
				setMascotStatusLoading(false);

        if (newStatus) {
          window.open(mascotPageUrl, '_blank');
        }
			})
			.catch((error) => {
				console.error('Error updating mascot status:', error);
				alert('Error updating mascot status');
			})
			.finally(() => {
				setMascotStatusLoading(false);
			});
	};

	if (websiteStatus === null || mascotStatus === null) {
		return <div className='centered'>Loading...</div>;
	}

	return (
		<div className='centered'>
			<h2>Launch Excel 2023!</h2>
			<br />
			<br />
			<br />
			<br />
			{websiteStatusLoading ? <p> Website Loading...</p> : <p>{" "}</p>}
			{mascotStatusLoading ? <p> Mascot Loading...</p> : <p>{" "} </p>}
			<div className='row'>
				<h2>Website Status</h2>
				<div className='switch-row'>
					<span>Off</span>
					<Switch
            disabled={websiteStatusLoading}
						onChange={handleWebsiteStatusChange}
						checked={websiteStatus}
						onColor='#86d3ff'
						onHandleColor='#2693e6'
						handleDiameter={30}
						uncheckedIcon={false}
						checkedIcon={false}
						height={20}
						width={48}
					/>
					<span>On</span>
				</div>
			</div>
			<br />
			<br />
			<br />
			<div className='row'>
				<h2>Mascot Status</h2>
				<div className='switch-row'>
					<span>Off</span>
					<Switch
            disabled={mascotStatusLoading}
						onChange={handleMascotStatusChange}
						checked={mascotStatus}
						onColor='#86d3ff'
						onHandleColor='#2693e6'
						handleDiameter={30}
						uncheckedIcon={false}
						checkedIcon={false}
						height={20}
						width={48}
					/>
					<span>On</span>
				</div>
			</div>
		</div>
	);
}

export default WebsiteStatus;
