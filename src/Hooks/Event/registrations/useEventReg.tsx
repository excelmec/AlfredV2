import { useContext, useState } from 'react';
import { ApiContext } from 'Contexts/Api/ApiContext';
import { getErrMsg } from 'Hooks/errorParser';
import { TypeSafeColDef } from 'Hooks/gridColumType';
import { IRegistration, ITeam } from '../registrationTypes';
import { GridValueGetterParams } from '@mui/x-data-grid';
import { useEventDesc } from '../useEventDesc';
import UserContext from 'Contexts/User/UserContext';
import {
	allEventEditRoles,
	allEventViewRoles,
	specificEventViewRoles,
} from '../eventRoles';

export function useEventRegList() {
	const { userData } = useContext(UserContext);
	const { axiosEventsPrivate, axiosAccPrivate } = useContext(ApiContext);
	const { event, loading: eventLoading, fetchEvent } = useEventDesc();

	const [institutionMap, setInstitutionMap] = useState<Map<number, string>>(
		new Map()
	);

	const [eventRegsIndividual, setEventRegsIndividual] = useState<
		IRegistration[]
	>([]);
	const [individualRegsLoading, setIndividualRegsLoading] =
		useState<boolean>(true);

	const [eventRegsTeam, setEventRegsTeam] = useState<ITeam[]>([]);
	const [teamRegsLoading, setTeamRegsLoading] = useState<boolean>(true);

	const [error, setError] = useState<string>('');

	async function fetchEventRegList(eventId: number) {
		try {
			setError('');

			const eventInfoPromise = await fetchEvent(eventId);
			const collegeInstitutionsPromise = axiosAccPrivate.get<
				{
					id: number;
					name: string;
				}[]
			>('/api/Institution/college/list');
			const shcoolInstitutionsPromise = axiosAccPrivate.get<
				{
					id: number;
					name: string;
				}[]
			>('/api/Institution/school/list');

			const [eventInfo, collegeInstitutions, shcoolInstitutions] =
				await Promise.all([
					eventInfoPromise,
					collegeInstitutionsPromise,
					shcoolInstitutionsPromise,
				]);

			if (
				userData.roles.some((role) => allEventEditRoles.includes(role))
			) {
				// This person has edit access to all events, so can view all
			} else if (
				userData.roles.some((role) => allEventViewRoles.includes(role))
			) {
				// This person has view access to all events, so can view all
			} else if (
				userData.roles.some((role) =>
					specificEventViewRoles.includes(role)
				)
			) {
				// This person only has view access to events where they are the event head
				if (
					eventInfo?.eventHead1?.email === userData.email ||
					eventInfo?.eventHead2?.email === userData.email
				) {
					// This person is an event head
				} else {
					setError('You do not have permission to view this page');
					return;
				}
			} else {
				// This person has no access to any event
				setError('You do not have permission to view this page');
				return;
			}

			const institutionMap = new Map<number, string>();
			collegeInstitutions.data.forEach((institution) => {
				institutionMap.set(institution.id, institution.name);
			});
			shcoolInstitutions.data.forEach((institution) => {
				institutionMap.set(institution.id, institution.name);
			});

			setInstitutionMap(institutionMap);

			fetchEventIndividualRegList(eventId, institutionMap);

			if (eventInfo?.isTeam) {
				fetchEventTeamRegList(eventId);
			} else {
				setEventRegsTeam([]);
				setTeamRegsLoading(false);
			}
		} catch (error) {
			setError(getErrMsg(error));
		}
	}

	async function fetchEventIndividualRegList(
		eventId: number,
		institutionMap: Map<number, string>
	) {
		try {
			setIndividualRegsLoading(true);
			const response = await axiosEventsPrivate.get<IRegistration[]>(
				`/api/registration/${eventId}/users`
			);

			const dataWithInstitution = response.data.map((reg) => {
				if (reg.user?.institutionId) {
					reg.user.institution =
						institutionMap.get(reg.user.institutionId) ??
						reg.user.institution ??
						'';
				}
				return reg;
			});

			setEventRegsIndividual(dataWithInstitution);
		} catch (error) {
			setError(getErrMsg(error));
		} finally {
			setIndividualRegsLoading(false);
		}
	}

	async function fetchEventTeamRegList(eventId: number) {
		try {
			setTeamRegsLoading(true);
			const response = await axiosEventsPrivate.get<ITeam[]>(
				`/api/Team/event/${eventId}`
			);

			setEventRegsTeam(response.data);
		} catch (error) {
			setError(getErrMsg(error));
		} finally {
			setTeamRegsLoading(false);
		}
	}

	const regIndividualCols: TypeSafeColDef<IRegistration>[] = [
		{
			field: 'excelId',
			headerName: 'User ID',
			type: 'string',
			align: 'center',
			headerAlign: 'center',
			width: 80,
		},
		{
			field: 'ambassadorId',
			headerName: 'Ambassador ID',
			type: 'string',
			align: 'center',
			headerAlign: 'center',
			width: 80,
		},
		{
			field: 'user.name',
			headerName: 'Name',
			type: 'string',
			minWidth: 150,
			maxWidth: 200,
			flex: 0.8,
			valueGetter: (params: GridValueGetterParams<IRegistration>) =>
				params.row?.user?.name,
		},
		{
			field: 'user.email',
			headerName: 'Email',
			type: 'string',
			minWidth: 250,
			align: 'center',
			flex: 0.8,
			valueGetter: (params: GridValueGetterParams<IRegistration>) =>
				params.row?.user?.email,
		},
		{
			field: 'user.gender',
			headerName: 'Gender',
			type: 'string',
			width: 60,
			align: 'center',
			valueGetter: (params: GridValueGetterParams<IRegistration>) => {
				if (params.row?.user?.gender === 'Male') {
					return 'M';
				} else if (params.row?.user?.gender === 'Female') {
					return 'F';
				} else {
					return params.row?.user?.gender;
				}
			},
		},
		{
			field: 'user.mobileNumber',
			headerName: 'Mobile Number',
			type: 'string',
			width: 120,
			align: 'center',
			valueGetter: (params: GridValueGetterParams<IRegistration>) =>
				params.row?.user?.mobileNumber,
		},
		{
			field: 'user.institution',
			headerName: 'Institution',
			type: 'string',
			width: 150,
			align: 'center',
			flex: 1,
			valueGetter: (params: GridValueGetterParams<IRegistration>) =>
				params.row?.user?.institution,
		},
		{
			field: 'user.category',
			headerName: 'Category',
			type: 'string',
			width: 100,
			align: 'center',
			valueGetter: (params: GridValueGetterParams<IRegistration>) =>
				params.row?.user?.category,
		},
		{
			field: 'teamId',
			headerName: 'Team ID',
			type: 'string',
			width: 100,
			align: 'center',
			valueGetter: (params: GridValueGetterParams<IRegistration>) =>
				params.row?.teamId ?? '',
		},
		{
			field: 'team.name',
			headerName: 'Team Name',
			type: 'string',
			minWidth: 150,
			align: 'center',
			flex: 0.8,
			valueGetter: (params: GridValueGetterParams<IRegistration>) =>
				params.row?.team?.name ?? '',
		},
	];

	const teamCols: TypeSafeColDef<ITeam>[] = [
		{
			field: 'id',
			headerName: 'Team ID',
			type: 'string',
			align: 'center',
			headerAlign: 'center',
			width: 100,
		},
		{
			field: 'ambassadorId',
			headerName: 'Ambassador ID',
			type: 'string',
			align: 'center',
			headerAlign: 'center',
			width: 80,
		},
		{
			field: 'name',
			headerName: 'Team Name',
			type: 'string',
			align: 'center',
			headerAlign: 'center',
			width: 200,
		},
		{
			field: 'memberCount',
			headerName: 'Team Member Count',
			type: 'number',
			align: 'center',
			headerAlign: 'center',
			width: 150,
			valueGetter: (params: GridValueGetterParams<ITeam>) =>
				params.row?.registrations?.length,
		},
		{
			field: 'members',
			headerName: 'Team Members',
			type: 'string',
			align: 'left',
			headerAlign: 'center',
			width: 150,
			flex: 1,
			valueGetter: (params: GridValueGetterParams<ITeam>) =>
				params.row?.registrations
					?.map((reg) => reg?.user?.name)
					.join(', '),
		},
	];

	async function checkInIndividual(registration: IRegistration) {
		try {
			if (registration.checkedIn) {
				const response = await axiosEventsPrivate.put<IRegistration>(
				`/api/registration/${registration.eventId}/check-in/${registration.id}`
				);
			} else {
				const response = await axiosEventsPrivate.put<IRegistration>(
				`/api/registration/${registration.eventId}/check-out/${registration.id}`
				);
			}
		} catch (error) {
			setError(getErrMsg(error));
		}
	}

	return {
		eventLoading,
		event,
		institutionMap,

		eventRegsIndividual,
		individualRegsLoading,
		regIndividualCols,
		checkInIndividual,

		teamCols,
		eventRegsTeam,
		teamRegsLoading,

		error,
		setError,
		fetchEventRegList,
	} as const;
}
