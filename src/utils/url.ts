if (!import.meta.env.VITE_ACC_BACKEND_BASE_URL) {
	throw new Error('VITE_ACC_BACKEND_URL env not set');
}

if (!import.meta.env.VITE_AUTH_BASE_URL) {
	throw new Error('VITE_AUTH_BASE_URL env not set');
}

const accBaseUrl = import.meta.env.VITE_ACC_BACKEND_BASE_URL;
const authBaseUrl = import.meta.env.VITE_AUTH_BASE_URL;

export { accBaseUrl, authBaseUrl };
