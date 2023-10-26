import { AxiosError } from 'axios';

export function getErrMsg(error: any): string {
	console.log({ error });
	if (typeof error === 'string') {
		return error;
	} else if (error instanceof AxiosError) {
		if (error.response?.status === 401) {
			return 'Please login to continue';
		} else if (error.response?.status === 403) {
			return 'You do not have permission to view this page';
		} else {
			return 'Something went wrong when fetching data';
		}
	} else {
		return 'Something went wrong';
	}
}
