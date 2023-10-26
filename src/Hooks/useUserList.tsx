import { useCallback, useContext, useState } from 'react';
import { ApiContext } from '../Contexts/Api/ApiContext';
import { getErrMsg } from './errorParser';

export interface User {
	id: number;
	name: string;
	email: string;
	role: string;
	picture: string | null;
	qrCodeUrl: string | null;
	institutionId: number | null;
	gender: string | null;
	mobileNumber: string | null;
	categoryId: number;
	category: string;

	// ambassador: null;
	// referrerAmbassadorId: null;
	// referrer: null;
	// isPaid: false;
}

export function useUserList() {
	const [userList, setUserList] = useState<User[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string>('');

	const { axiosAccPrivate } = useContext(ApiContext);

	const fetchUserList = useCallback(
		async function () {
			try {
				setLoading(true);
				setError('');
				const response = await axiosAccPrivate.get<{
					data: User[];
					pagination: {
						totalCount: number;
						pageSize: number;
						currentPage: number;
						totalPages: number;
						hasNext: boolean;
						hasPrevious: boolean;
					};
				}>('/api/admin/users?PageNumber=1&PageSize=1000000');

				setUserList(response.data?.data);
			} catch (error) {
				setError(getErrMsg(error));
			} finally {
				setLoading(false);
			}
		},
		[axiosAccPrivate]
	);

	return { userList, loading, error, fetchUserList } as const;
}
