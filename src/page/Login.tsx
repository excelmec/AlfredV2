import React from 'react';
import { authBaseUrl } from '../utils/url';

const Login: React.FC = () => {
  const handleLogin = () => {
    window.location.href = `${authBaseUrl}/auth/login?redirect_to=${window.location.href}`;
  };

  return (
    <div>
      <h1>Login</h1>
      <button onClick={handleLogin}>Login with Excel</button>
    </div>
  );
};

export default Login;
