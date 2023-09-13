import React, { useEffect } from 'react';

const Login: React.FC = () => {
  const handleLogin = () => {
    window.location.href = `https://auth.excelmec.org/auth/login?redirect_to=${window.location.hostname}`;
  };

  useEffect(() => {
   
    const getParameterByName = (name: string, url?: string): string | null => {
      if (!url) url = window.location.href;
      name = name.replace(/[[\]]/g, '\\$&');
      const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
      const results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, ' '));
    };

    const refreshToken = getParameterByName('refreshToken');

    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }, []); 

  return (
    <div>
      <h1>Login</h1>
      <button onClick={handleLogin}>Login with Excel</button>
    </div>
  );
};

export default Login;
