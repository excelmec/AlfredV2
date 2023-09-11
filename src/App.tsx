import { useEffect } from 'react'
import './App.css'
import CampusAmbassador from './pages/CampusAmbassador/CampusAmbassador'

function App() {
  const refreshToken = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTIyNjEiLCJlbWFpbCI6ImpvZWxrOTg5NUBnbWFpbC5jb20iLCJuYmYiOjE2OTQ0MzQwNzIsImV4cCI6MTcyNjA1NjQ3MiwiaWF0IjoxNjk0NDM0MDcyLCJpc3MiOiJodHRwOi8vZXhjZWxtZWMub3JnLyJ9.EJXGm34giN70A-2GStKmg5rlzp5YA-XKyGE6lrVCSTeFBpZBLvYxGiShWpa3oLjO4Nz64NnsyAw52BXa8BHXFQ"; // Replace with your actual refresh token
  useEffect(() => {
    async function getAccessToken(refreshToken: string,  tokenEndpoint: string,) {
      const accessToken = localStorage.getItem('access_token');
      const accessTokenExpiration = localStorage.getItem('access_token_expiration');
    
      if (accessToken && accessTokenExpiration) {
        // Check if the access token is expired
        const expirationTime = new Date(accessTokenExpiration);
        if (expirationTime > new Date()) {
          console.log(accessToken)
          return accessToken;
        }
      }
    
      // Access token is either not stored or expired, get a new one

      try {
        const response = await fetch(tokenEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json-patch+json',
          },
          body: JSON.stringify({
            refreshToken: refreshToken,
          })
        });
    
        if (!response.ok) {
          throw new Error('Failed to get access token');
        }
    
        const tokenData = await response.json();
        console.log(tokenData.accessToken)
        const newAccessToken = tokenData.accessToken;
        const expiresIn = 840; // The expiration time in seconds
    
        // Calculate the expiration time
        const expirationTimeInSeconds = expiresIn ?expiresIn : 840; // Default to 1 hour
        const expirationDate = new Date(Date.now() + expirationTimeInSeconds * 1000);
    
        // Store the new access token and its expiration time
        localStorage.setItem('access_token', newAccessToken);
        console.log(newAccessToken)
        localStorage.setItem('access_token_expiration', expirationDate.toISOString());
        window.location.reload();
    
        return newAccessToken;
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
    getAccessToken(refreshToken,'https://excel-accounts-backend-z5t623hcnq-el.a.run.app/api/Auth/refresh')
  }, [])

  return (
    <>
    <CampusAmbassador/>
    </>
  )
}

export default App
