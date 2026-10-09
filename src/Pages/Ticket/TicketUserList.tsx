import { useContext, useEffect, useState, useMemo } from 'react';
import { debounce } from 'lodash';
import { UploadSimpleIcon, WarningCircleIcon, CheckCircleIcon } from '@phosphor-icons/react';
import UserContext from 'Contexts/User/UserContext';
import { ticketAdminRoles } from 'Hooks/Ticket/ticketRoles';
import { useTickets } from '../../Hooks/Ticket/useTickets';
import { ITicketUser } from '../../Hooks/Ticket/ticketTypes';
import { useAttendees } from '../../Hooks/Ticket/useAttendees';
import { useProshows } from '../../Hooks/Ticket/useProshows';
import { PageHeader } from '@/Components/page-header';
import { PageError } from '@/Components/page-state';
import { DataTable } from '@/Components/data-table/DataTable';
import type { DataColumn } from '@/Components/data-table/types';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Spinner } from '@/Components/ui/spinner';
import { cn } from '@/lib/utils';

function getRowId(row: ITicketUser) {
  return row.email;
}

const statusClass: Record<string, string> = {
  SCANNED: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  EMAILED: 'bg-primary/10 text-primary',
};

export default function TicketUserList() {
  const { userData, userLoading } = useContext(UserContext);

  const { ticketList, loading, error, setError, fetchTicketList, rowCount, invalidateRowCount } =
    useTickets();
  const {
    uploadAttendees,
    uploading,
    error: uploadError,
    uploadResult,
    clearResult,
  } = useAttendees();
  const { proshows, fetchProshows } = useProshows();

  const [viewableTickets, setViewableTickets] = useState<ITicketUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 50,
  });

  // Upload State
  const [uploadOpen, setUploadOpen] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!userData.roles.some((role) => ticketAdminRoles.includes(role))) return;
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadOpen(true);

    event.target.value = '';

    const result = await uploadAttendees(file);
    if (result) {
      invalidateRowCount();
      fetchTicketList(
        paginationModel.page * paginationModel.pageSize,
        paginationModel.pageSize,
        searchTerm,
      );
    }
  };

  const handleCloseUpload = () => {
    if (uploading) return;
    setUploadOpen(false);
    clearResult();
  };

  useEffect(() => {
    fetchProshows();
  }, [fetchProshows]);

  const dynamicColumns = useMemo(() => {
    const baseColumns: DataColumn<ITicketUser>[] = [
      { field: 'name', headerName: 'Name', type: 'string', width: 180 },
      { field: 'email', headerName: 'Email', type: 'string', width: 240 },
    ];

    const proshowCols: DataColumn<ITicketUser>[] = proshows.map((proshow) => ({
      field: `proshow_${proshow.title}`,
      headerName: proshow.title,
      sortable: false,
      width: 380,
      renderCell: ({ row }) => {
        const userProshow = row.proshows?.find((p) => p.title === proshow.title);
        if (!userProshow) return <span className="text-muted-foreground">-</span>;

        return (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 py-1 text-xs">
            <Badge variant="secondary" className={cn(statusClass[userProshow.status])}>
              {userProshow.status}
            </Badge>
            <span className="whitespace-nowrap">
              <strong>Emailed:</strong>{' '}
              {userProshow.emailed_at ? new Date(userProshow.emailed_at).toLocaleString() : '-'}
            </span>
            <span className="whitespace-nowrap">
              <strong>Scanned:</strong>{' '}
              {userProshow.scanned_at ? new Date(userProshow.scanned_at).toLocaleString() : '-'}
            </span>
          </div>
        );
      },
    }));

    return [...baseColumns, ...proshowCols];
  }, [proshows]);

  // Debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce((search: string, page: number, pageSize: number) => {
        fetchTicketList(page * pageSize, pageSize, search);
      }, 500),
    [fetchTicketList],
  );

  // Trigger fetch when searchTerm or pagination changes
  useEffect(() => {
    debouncedSearch(searchTerm, paginationModel.page, paginationModel.pageSize);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, paginationModel, debouncedSearch]);

  useEffect(() => {
    if (loading || userLoading) return;

    setViewableTickets(ticketList);
  }, [ticketList, loading, userData, userLoading, setError]);

  if (error) {
    return <PageError>{error}</PageError>;
  }

  return (
    <>
      <PageHeader
        title="Attendees"
        description="Everyone with a proshow ticket and the status of each ticket."
        actions={
          userData.roles.some((role) => ticketAdminRoles.includes(role)) && (
            <Button asChild>
              <label className="cursor-pointer">
                <UploadSimpleIcon /> Upload attendees
                <input type="file" hidden accept=".csv" onChange={handleFileChange} />
              </label>
            </Button>
          )
        }
      />

      <DataTable
        columns={dynamicColumns}
        rows={viewableTickets}
        getRowId={getRowId}
        loading={loading}
        exportable={false}
        searchPlaceholder="Search users..."
        search={{
          value: searchTerm,
          onChange: (value) => {
            setSearchTerm(value);
            setPaginationModel((prev) => ({ ...prev, page: 0 })); // Reset to page 0 on search
          },
        }}
        serverPagination={{
          rowCount,
          pageIndex: paginationModel.page,
          pageSize: paginationModel.pageSize,
          onPaginationChange: ({ pageIndex, pageSize }) =>
            setPaginationModel({ page: pageIndex, pageSize }),
        }}
      />

      <Dialog open={uploadOpen} onOpenChange={(open) => !open && handleCloseUpload()}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{uploading ? 'Uploading attendees...' : 'Upload result'}</DialogTitle>
            <DialogDescription>
              {uploading
                ? 'Processing file, please wait...'
                : 'Summary of the attendees file that was processed.'}
            </DialogDescription>
          </DialogHeader>

          {uploading && (
            <div className="flex items-center justify-center gap-2 p-8 text-muted-foreground">
              <Spinner /> Processing file...
            </div>
          )}

          {!uploading && !uploadResult && !uploadError && (
            <p className="p-2 text-sm text-muted-foreground">Select a file to start uploading.</p>
          )}

          {!uploading && uploadError && (
            <Alert variant="destructive">
              <WarningCircleIcon />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          {!uploading && uploadResult && (
            <div className="grid gap-4">
              <Alert>
                <CheckCircleIcon />
                <AlertTitle>Upload processed</AlertTitle>
                <AlertDescription>Processed {uploadResult.total_rows} rows.</AlertDescription>
              </Alert>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg border p-3">
                  <div className="text-xl font-semibold tabular-nums">
                    {uploadResult.total_rows}
                  </div>
                  <div className="text-xs text-muted-foreground">Total rows</div>
                </div>
                <div className="rounded-lg border bg-emerald-500/10 p-3">
                  <div className="text-xl font-semibold text-emerald-700 tabular-nums dark:text-emerald-300">
                    {uploadResult.successfully_upserted}
                  </div>
                  <div className="text-xs text-muted-foreground">Success</div>
                </div>
                <div
                  className={cn(
                    'rounded-lg border p-3',
                    uploadResult.rejected_total > 0 && 'bg-destructive/10',
                  )}
                >
                  <div
                    className={cn(
                      'text-xl font-semibold tabular-nums',
                      uploadResult.rejected_total > 0 && 'text-destructive',
                    )}
                  >
                    {uploadResult.rejected_total}
                  </div>
                  <div className="text-xs text-muted-foreground">Rejected</div>
                </div>
              </div>

              {uploadResult.rejected_preview.length > 0 && (
                <div className="grid gap-2">
                  <h4 className="text-sm font-semibold text-destructive">Rejection preview</h4>
                  <ScrollArea className="max-h-52 rounded-lg border">
                    <ul className="divide-y">
                      {uploadResult.rejected_preview.map((item, idx) => (
                        <li key={idx} className="p-3 text-sm">
                          <div className="font-medium text-destructive">
                            Row error: {item.error}
                          </div>
                          <div className="font-mono text-xs break-all text-muted-foreground">
                            Data: {JSON.stringify(item.data)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={handleCloseUpload} disabled={uploading}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
