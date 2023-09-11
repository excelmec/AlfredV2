import React, { useEffect, useState } from 'react';
import SideNav from '../../common/SideNav/SideNav';
import TopNav from '../../common/TopNav/TopNav';
import './CampusAmbassador.css';

// Define a TypeScript interface for the campus ambassador data
interface CampusAmbassadorData {
    ambassadorId: number;
    id: number;
  name: string;
  email: string;
  mobileNumber: number;
  group: string;
  referralPoints: number;
  institutionName: string;
  category: string;
  freeMembership: number;
  paidMembership: number;

  // Add more fields as needed
}

const CampusAmbassador: React.FC = () => {
    var access_token = localStorage.getItem('access_token')
  
  // State to manage the list of campus ambassadors and their information
  const [campusAmbassadors, setCampusAmbassadors] = useState<CampusAmbassadorData[]>([]);
  const [campusAmbassadorsFull, setCampusAmbassadorsFull] = useState<CampusAmbassadorData[]>([]);
  useEffect(() => {
    fetch('https://excel-accounts-backend-z5t623hcnq-el.a.run.app/api/Ambassador/list',{
        headers: {
            authorization: 'Bearer ' + access_token
        }
    }) 
    .then(response => response.json())
    .then(data => {
      console.log(data)
      setCampusAmbassadors(data)
    })
  },[])
  useEffect(() => {
    fetch('https://excel-accounts-backend-z5t623hcnq-el.a.run.app/api/Ambassador',{
        headers: {
            authorization: 'Bearer ' + access_token
        }
    }) 
    .then(response => response.json())
    .then(data => {
       var newData = [data]
       setCampusAmbassadorsFull(newData)
    })
  },[])
  


  // State to manage the selected campus ambassador for the modal
  const [selectedAmbassador, setSelectedAmbassador] = useState<CampusAmbassadorData | null>(null);

  // State to control the visibility of the modal
  const [isModalOpen, setIsModalOpen] = useState(false);


  // Function to open the modal and display full data of a campus ambassador
  const openModal = (ambassadorId: number) => {
    console.log(campusAmbassadorsFull)
    console.log(campusAmbassadors)
    // Find the detailed ambassador information from the response
    const detailedAmbassador = campusAmbassadorsFull.find((ambassador) => ambassador.ambassadorId === ambassadorId);
    
    if (detailedAmbassador) {
      setSelectedAmbassador(detailedAmbassador);
      setIsModalOpen(true);
    } else {
      console.log(`Detailed information for Ambassador ID ${ambassadorId} not found.`);
    }
  };

  // Function to close the modal
  const closeModal = () => {
    setSelectedAmbassador(null);
    setIsModalOpen(false);
  };

  // Function to add referral points to a campus ambassador
  const addPoints = (ambassadorId: number) => {
    const pointsInput = prompt('Enter the number of referral points to add:');
    if (pointsInput === null || pointsInput === '') {
      alert('Please enter a valid number of referral points.');
      return;
    }

    const pointsToAdd = parseInt(pointsInput, 10);
    if (isNaN(pointsToAdd)) {
      alert('Please enter a valid number of referral points.');
      return;
    }

    const updatedAmbassadors = campusAmbassadors.map((ambassador) => {
      if (ambassador.ambassadorId === ambassadorId) {
        return { ...ambassador, referralPoints: ambassador.referralPoints + pointsToAdd };
      }
      return ambassador;
    });

    setCampusAmbassadors(updatedAmbassadors);
  };

  // Function to change or create a group for a campus ambassado

  return (
    <div>
      <TopNav />
      <div className="campusAmbassador">
        <SideNav />
        <div className="campusContent">
          <h2>Campus Ambassador</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Free Membership</th>
                <th>Paid Membership</th>
                <th>Group</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campusAmbassadors.map((ambassador) => (
                <tr key={ambassador.ambassadorId}>
                  <td>{ambassador.name}</td>
                  <td>{ambassador.email}</td>
                  <td>{ambassador.freeMembership}</td>
                  <td>{ambassador.paidMembership}</td>
                  <td>
                    <select
                        value={ambassador.group}
                      onChange={(e) => {
                        const newGroupValue = e.target.value;

                        // Update the ambassador's group in the campusAmbassadors array
                        const updatedAmbassadors = campusAmbassadors.map((a) => {
                          if (a.ambassadorId === ambassador.ambassadorId) {
                            return { ...a, group: newGroupValue };
                          }
                          return a;
                        });
                    
                        // Update the campusAmbassadors state with the modified array
                        setCampusAmbassadors(updatedAmbassadors);
                      }}
                    >
                      {campusAmbassadors.map((a) => (
                        <option key={a.ambassadorId} value={a.group}>
                          {a.group}
                        </option>
                      ))}
                      <option value="New Group">New Group</option>
                    </select>
                  </td>
                  <td>
                    <button onClick={() => openModal(ambassador.ambassadorId)}>
                      View Details
                    </button>
                    <button onClick={() => addPoints(ambassador.ambassadorId)}>
                      Add Points
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedAmbassador && (
        <div className="modal">
          <div className="modal-content">
            <h2>Full Details</h2>
            <p>Name: {selectedAmbassador.name}</p>
            <p>Email: {selectedAmbassador.email}</p>
            <p>Phone: {selectedAmbassador.mobileNumber}</p>
            <p>Group: {selectedAmbassador.group}</p>
            <p>Referral Points: {selectedAmbassador.referralPoints}</p>
            <p>Institution Name: {selectedAmbassador.institutionName}</p>
            {/* Add more fields as needed */}
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampusAmbassador;
