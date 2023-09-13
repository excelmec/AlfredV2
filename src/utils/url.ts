//const hostname = window.location.hostname === 'localhost' ? "staging.accounts.excelmec.org" : window.location.hostname;
// const hostname = "excel-accounts-backend-ovhv32pszq-el.a.run.app";

if (!import.meta.env.VITE_ACC_BACKEND_URL) {
  throw new Error("VITE_ACC_BACKEND_URL env not set");
}

const hostname = import.meta.env.VITE_ACC_BACKEND_URL;

export const AccbaseURL = hostname;
