declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    REACT_APP_AUTH_REDIR_URL: string;
    REACT_APP_ACC_BACKEND_BASE_URL: string;
    REACT_APP_EVENTS_BACKEND_BASE_URL: string;
  }
}
