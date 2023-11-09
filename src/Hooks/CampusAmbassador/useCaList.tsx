import { useContext, useState } from 'react';
import { ApiContext } from 'Contexts/Api/ApiContext';
import { getErrMsg } from 'Hooks/errorParser';

export interface CAEvents {
	ambassadorId: number;
	caTeamId: number | null;
	referralPoints: number;
	bonusPoints: number;
	totalPoints: number;
}

export interface CaListRes extends CAEvents {
	email: string;
	image: string;
	name: string;
}

export function useCaList() {
	const [caList, setCaList] = useState<CaListRes[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string>('');

	const { axiosEventsPrivate } = useContext(ApiContext);
	async function fetchCaList() {
		try {
			setLoading(true);
			setError('');
			const response = await axiosEventsPrivate.get<CaListRes[]>(
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
