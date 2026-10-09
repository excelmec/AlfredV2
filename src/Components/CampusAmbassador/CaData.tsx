import { useState } from 'react';
import { FloppyDiskIcon, MinusCircleIcon, PlusIcon, XIcon } from '@phosphor-icons/react';
import { CaData, CaPointLog } from 'Hooks/CampusAmbassador/useCa';
import { ConfirmDialog } from '@/Components/confirm-dialog';
import { DetailCard } from '@/Components/detail-card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Spinner } from '@/Components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';

interface CaDataViewProps {
  ca: CaData;
  caPointLog: CaPointLog[];
  addNewPoint: (point: Omit<CaPointLog, 'id'>) => Promise<void>;
  savingNewPoint: boolean;
  deletePoint: (pointId: number) => Promise<void>;
  deletingPoint: boolean;
}

export default function CaDataView(props: CaDataViewProps) {
  const { ca } = props;
  return (
    <div className="grid gap-6">
      <DetailCard
        title={ca.name}
        description={ca.email}
        columns={3}
        items={[
          { label: 'Ambassador ID', value: ca.ambassadorId },
          { label: 'Team', value: ca.teamName },
          { label: 'Referral points', value: ca.referralPoints },
          { label: 'Bonus points', value: ca.bonusPoints },
          { label: 'Total points', value: <Badge>{ca.totalPoints}</Badge> },
        ]}
      />
      <PointLogTable {...props} />
    </div>
  );
}

function PointLogTable({
  ca,
  caPointLog,
  addNewPoint,
  savingNewPoint,
  deletePoint,
  deletingPoint,
}: CaDataViewProps) {
  const [addingNewPoint, setAddingNewPoint] = useState<boolean>(false);
  const [newPointDescription, setNewPointDescription] = useState<string>('');
  const [newPointValue, setNewPointValue] = useState<string>('');
  const [pointToDelete, setPointToDelete] = useState<number | null>(null);

  async function saveNewPoint() {
    await addNewPoint({
      description: newPointDescription,
      pointAwarded: Number(newPointValue),
      ambassadorId: ca.ambassadorId,
      dateTime: new Date().toISOString(),
    });

    setAddingNewPoint(false);
    setNewPointDescription('');
    setNewPointValue('');
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Points awarded</CardTitle>
        {!addingNewPoint && (
          <Button size="sm" onClick={() => setAddingNewPoint(true)}>
            <PlusIcon weight="bold" /> Add point
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Date time</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Points</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {caPointLog.length === 0 && !addingNewPoint && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No points awarded yet.
                  </TableCell>
                </TableRow>
              )}
              {caPointLog.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-nowrap">{row.dateTime}</TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.pointAwarded}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Delete point"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setPointToDelete(row.id)}
                      disabled={deletingPoint}
                    >
                      <MinusCircleIcon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {addingNewPoint && (
                <TableRow className="hover:bg-transparent">
                  <TableCell className="text-muted-foreground">Now</TableCell>
                  <TableCell>
                    <Input
                      placeholder="Description"
                      value={newPointDescription}
                      onChange={(e) => setNewPointDescription(e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      placeholder="Points"
                      className="ml-auto w-24 text-right"
                      value={newPointValue}
                      onChange={(e) => setNewPointValue(e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="icon-sm"
                        aria-label="Save"
                        onClick={saveNewPoint}
                        disabled={savingNewPoint}
                      >
                        {savingNewPoint ? <Spinner /> : <FloppyDiskIcon />}
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="outline"
                        aria-label="Cancel"
                        onClick={() => setAddingNewPoint(false)}
                        disabled={savingNewPoint}
                      >
                        <XIcon />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <ConfirmDialog
        open={pointToDelete !== null}
        title="Delete point"
        description="Do you want to delete this point?"
        confirmLabel="Delete"
        destructive
        loading={deletingPoint}
        onCancel={() => setPointToDelete(null)}
        onConfirm={async () => {
          if (pointToDelete !== null) await deletePoint(pointToDelete);
          setPointToDelete(null);
        }}
      />
    </Card>
  );
}
