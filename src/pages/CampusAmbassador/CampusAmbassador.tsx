import React, { useEffect, useState } from 'react';
import SideNav from '../../common/SideNav/SideNav';
import TopNav from '../../common/TopNav/TopNav';
import './CampusAmbassador.css';
import { getwithAT } from '../../utils/api';

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
    const [campusAmbassadors, setCampusAmbassadors] = useState<CampusAmbassadorData[]>([]);


  
  // Combine both API calls into one useEffect
  useEffect(() => {
   
    const value = getwithAT('/api/Ambassador/list');
    console.log(value);

    // Fetch detailed campus ambassador data
  }, []);
  
  



  // Function to close the modal


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

    
    </div>
  );
};

export default CampusAmbassador;
