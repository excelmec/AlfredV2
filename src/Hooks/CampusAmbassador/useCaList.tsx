import { useContext, useState } from 'react';
import { ApiContext } from 'Contexts/Api/ApiContext';
import { getErrMsg } from 'Hooks/errorParser';

export interface CA {
	ambassadorId: number;
	caTeamId: number | null;
	email: string;
	image: string;
	name: string;
	referralPoints: number;
	bonusPoints: number;
	totalPoints: number;
}

export function useCaList() {
	const [caList, setCaList] = useState<CA[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string>('');

	const { axiosEventsPrivate } = useContext(ApiContext);
	async function fetchCaList() {
		try {
			setLoading(true);
			setError('');
			const response = await axiosEventsPrivate.get<CA[]>(
				'/api/ambassadors/list'
			);

			setCaList(response.data);
		} catch (error) {
			setError(getErrMsg(error));
		} finally {
			setLoading(false);
		}
	}

	return { caList, loading, error, fetchCaList } as const;
}
