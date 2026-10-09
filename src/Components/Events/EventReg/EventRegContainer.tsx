import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { IRegistration, ITeam } from 'Hooks/Event/registrationTypes';
import { TypeSafeColDef } from 'Hooks/gridColumType';
import { IEvent } from 'Hooks/Event/eventTypes';
import EventRegIndividual from './EventRegIndividual/EventRegIndividual';
import EventRegTeams from './EventRegTeams/EventRegTeams';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Skeleton } from '@/Components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';

export default function EventRegContainer({
  individualRegsLoading,
  eventRegsIndividual,
  regIndividualCols,
  checkInIndividual,

  event,
  institutionMap,

  teamCols,
  eventRegsTeam,
  teamRegsLoading,
}: {
  event: IEvent | undefined;
  institutionMap: Map<number, string>;

  individualRegsLoading: boolean;
  eventRegsIndividual: IRegistration[];
  regIndividualCols: TypeSafeColDef<IRegistration>[];
  checkInIndividual: (registration: IRegistration) => Promise<void>;

  teamCols: TypeSafeColDef<ITeam>[];
  eventRegsTeam: ITeam[];
  teamRegsLoading: boolean;
}) {
  const navigate = useNavigate();

  return (
    <div className="grid gap-6">
      <div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeftIcon /> Back
        </Button>
      </div>

      <RegStatistics
        individualRegsLoading={individualRegsLoading}
        eventRegsIndividual={eventRegsIndividual}
        event={event}
        eventRegsTeam={eventRegsTeam}
        teamRegsLoading={teamRegsLoading}
      />

      <section className="grid gap-3">
        <h3 className="text-lg font-semibold tracking-tight">Registrations (user wise)</h3>
        <EventRegIndividual
          individualRegsLoading={individualRegsLoading}
          eventRegsIndividual={eventRegsIndividual}
          regIndividualCols={regIndividualCols}
          checkInIndividual={checkInIndividual}
          isTeam={event?.isTeam ?? false}
        />
      </section>

      {event?.isTeam && (
        <section className="grid gap-3">
          <h3 className="text-lg font-semibold tracking-tight">Registrations (team wise)</h3>
          <EventRegTeams
            institutionMap={institutionMap}
            teamCols={teamCols}
            eventRegsTeam={eventRegsTeam}
            teamRegsLoading={teamRegsLoading}
          />
        </section>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  loading,
}: {
  label: string;
  value: number | string;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <CardTitle className="text-3xl tabular-nums">{value}</CardTitle>
        )}
      </CardHeader>
    </Card>
  );
}

function RegStatistics({
  individualRegsLoading,
  eventRegsIndividual,
  event,
  eventRegsTeam,
  teamRegsLoading,
}: {
  event: IEvent | undefined;

  individualRegsLoading: boolean;
  eventRegsIndividual: IRegistration[];

  eventRegsTeam: ITeam[];
  teamRegsLoading: boolean;
}) {
  const regsFromCollegeMap = new Map<string, number>();

  eventRegsIndividual.forEach((reg) => {
    const institutionName = reg.user?.institution;
    if (institutionName) {
      regsFromCollegeMap.set(institutionName, (regsFromCollegeMap.get(institutionName) ?? 0) + 1);
    }
  });

  const loading = individualRegsLoading || teamRegsLoading;
  const institutions = Array.from(regsFromCollegeMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total registrations"
          value={eventRegsIndividual.length}
          loading={loading}
        />
        {event?.isTeam && (
          <StatCard label="Total teams" value={eventRegsTeam?.length ?? 0} loading={loading} />
        )}
        <StatCard
          label="Checked in"
          value={eventRegsIndividual.filter((r) => r.checkedIn).length}
          loading={loading}
        />
        <StatCard label="Institutions" value={regsFromCollegeMap.size} loading={loading} />
      </div>

      {!loading && institutions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Institution wise registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-72 overflow-y-auto rounded-lg border">
              <Table>
                <TableHeader className="sticky top-0 bg-muted">
                  <TableRow>
                    <TableHead>Institution</TableHead>
                    <TableHead className="w-24 text-right">Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {institutions.map(([college, count]) => (
                    <TableRow key={college}>
                      <TableCell>{college}</TableCell>
                      <TableCell className="text-right tabular-nums">{count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
