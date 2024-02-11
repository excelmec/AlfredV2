import { IUser } from "Hooks/useUserList";
import { IEvent } from "./eventTypes";
import { CAEvents } from "Hooks/CampusAmbassador/useCaList";

export interface ITeam {
    ambassadorId: Pick<CAEvents, 'ambassadorId'>,
    eventId: Pick<IEvent, 'id'>,
    id: number,
    name: string,

    registrations: IRegistration[],
}

export interface IRegistration {
    ambassadorId: Pick<CAEvents, 'ambassadorId'>,
    eventId: Pick<IEvent, 'id'>,
    excelId: Pick<IUser, 'id'>,

    // Will be null for non team events
    teamId?: Pick<ITeam, 'id'>,
    team: ITeam,

    /**
     * Institution name in user object needs to be populated manually
     * with extra api call
     */
    user: IUser,
}