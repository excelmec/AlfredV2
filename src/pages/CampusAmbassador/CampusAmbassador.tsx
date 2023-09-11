import React, { useState } from 'react';
import SideNav from '../../common/SideNav/SideNav';
import TopNav from '../../common/TopNav/TopNav';
import './CampusAmbassador.css';

// Define a TypeScript interface for the campus ambassador data
interface CampusAmbassadorData {
  id: number;
  name: string;
  email: string;
  phone: string;
  group: string;
  referralPoints: number;
  // Add more fields as needed
}

const CampusAmbassador: React.FC = () => {
  // State to manage the list of campus ambassadors and their information
  const [campusAmbassadors, setCampusAmbassadors] = useState<CampusAmbassadorData[]>([
    { id: 1, name: 'Joel K George', email: 'joel@example.com', phone: '123-456-7890', group: 'Group A', referralPoints: 50 },
    { id: 2, name: 'Alan', email: 'alan@example.com', phone: '987-654-3210', group: 'Group B', referralPoints: 30 },
    // Add more ambassadors as needed
  ]);

  // State to manage the selected campus ambassador for the modal
  const [selectedAmbassador, setSelectedAmbassador] = useState<CampusAmbassadorData | null>(null);

  // State to control the visibility of the modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State to store the new group when changing/creating a group
  const [newGroup, setNewGroup] = useState('');

  // Function to open the modal and display full data of a campus ambassador
  const openModal = (ambassador: CampusAmbassadorData) => {
    setSelectedAmbassador(ambassador);
    setIsModalOpen(true);
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
      if (ambassador.id === ambassadorId) {
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
                <th>Phone</th>
                <th>Group</th>
                <th>Referral Points</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campusAmbassadors.map((ambassador) => (
                <tr key={ambassador.id}>
                  <td>{ambassador.name}</td>
                  <td>{ambassador.email}</td>
                  <td>{ambassador.phone}</td>
                  <td>
                    <select
                      onChange={(e) => setNewGroup(e.target.value)}
                    >
                      {campusAmbassadors.map((a) => (
                        <option key={a.id} value={a.group}>
                          {a.group}
                        </option>
                      ))}
                      <option value="New Group">New Group</option>
                    </select>
                  </td>
                  <td>{ambassador.referralPoints}</td>
                  <td>
                    <button onClick={() => openModal(ambassador)}>
                      View Details
                    </button>
                    <button onClick={() => addPoints(ambassador.id)}>
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
            <p>Phone: {selectedAmbassador.phone}</p>
            <p>Group: {selectedAmbassador.group}</p>
            <p>Referral Points: {selectedAmbassador.referralPoints}</p>
            {/* Add more fields as needed */}
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampusAmbassador;
