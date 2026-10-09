import { ChangeEvent, useRef, useState } from 'react';
import { toast } from 'sonner';
import { PlusIcon, UploadSimpleIcon } from '@phosphor-icons/react';
import { getErrMsg } from 'Hooks/errorParser';
import { CaListRes } from 'Hooks/CampusAmbassador/useCaList';
import { NewAmbassador, caCodePattern, parseCaCsv } from 'Hooks/CampusAmbassador/parseCaCsv';
import { Button } from '@/Components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Progress } from '@/Components/ui/progress';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Spinner } from '@/Components/ui/spinner';

interface AddAmbassadorsProps {
  /** Existing ambassadors, used to skip emails and codes that are already registered. */
  caList: CaListRes[];
  addAmbassador: (ambassador: NewAmbassador) => Promise<CaListRes>;
  /** Called after ambassadors were created so the list can be reloaded. */
  onAdded: () => void;
}

interface ImportResult {
  created: number;
  skipped: string[];
  failed: string[];
}

const emptyAmbassador: NewAmbassador = { name: '', college: '', email: '', phone: '', code: '' };

const emailKey = (email: string | null | undefined) => (email ?? '').trim().toLowerCase();
const codeKey = (code: string | null | undefined) => (code ?? '').trim().toUpperCase();

/** Why a row cannot be added given the emails and codes already taken, or '' if it can. */
function conflictOf(row: NewAmbassador, emails: Set<string>, codes: Set<string>) {
  if (!caCodePattern.test(row.code)) return 'code must be 8 letters or digits';
  if (codes.has(codeKey(row.code))) return 'code already in use';
  if (row.email && emails.has(emailKey(row.email))) return 'email already registered';
  return '';
}

export default function AddAmbassadors({ caList, addAmbassador, onAdded }: AddAmbassadorsProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [newAmbassador, setNewAmbassador] = useState<NewAmbassador>(emptyAmbassador);
  const [adding, setAdding] = useState(false);

  const fileInput = useRef<HTMLInputElement>(null);
  const [importRows, setImportRows] = useState<NewAmbassador[] | null>(null);
  const [importing, setImporting] = useState(false);
  const [importDone, setImportDone] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const existingEmails = new Set(caList.map((ca) => emailKey(ca.email)).filter(Boolean));
  const existingCodes = new Set(caList.map((ca) => codeKey(ca.code)).filter(Boolean));

  function setField(field: keyof NewAmbassador) {
    return (e: ChangeEvent<HTMLInputElement>) =>
      setNewAmbassador((current) => ({ ...current, [field]: e.target.value }));
  }

  function handleAddClose() {
    if (adding) return;
    setAddOpen(false);
  }

  async function handleAdd() {
    const ambassador = {
      name: newAmbassador.name.trim(),
      college: newAmbassador.college.trim(),
      email: newAmbassador.email.trim(),
      phone: newAmbassador.phone.trim(),
      code: codeKey(newAmbassador.code),
    };
    if (!ambassador.name) {
      toast.error('Name is required');
      return;
    }
    const conflict = conflictOf(ambassador, existingEmails, existingCodes);
    if (conflict) {
      toast.error(`Cannot add: ${conflict}`);
      return;
    }

    try {
      setAdding(true);
      const created = await addAmbassador(ambassador);
      toast.success(`Added ${created.name} with code ${created.code}`);
      setNewAmbassador(emptyAmbassador);
      setAddOpen(false);
      onAdded();
    } catch (error) {
      toast.error(getErrMsg(error));
    } finally {
      setAdding(false);
    }
  }

  async function handleFileChosen(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset so choosing the same file again fires onChange
    e.target.value = '';
    if (!file) return;

    try {
      const rows = parseCaCsv(await file.text());
      if (rows.length === 0) throw new Error('No ambassadors found in the file');
      setImportResult(null);
      setImportDone(0);
      setImportRows(rows);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not read the file');
    }
  }

  function handleImportClose() {
    if (importing) return;
    setImportRows(null);
  }

  async function handleImport() {
    if (!importRows) return;
    const result: ImportResult = { created: 0, skipped: [], failed: [] };
    const seenEmails = new Set(existingEmails);
    const seenCodes = new Set(existingCodes);

    setImporting(true);
    for (let i = 0; i < importRows.length; i++) {
      const row = importRows[i];
      const conflict = conflictOf(row, seenEmails, seenCodes);
      if (conflict) {
        result.skipped.push(`${row.name} (${row.code || 'no code'}): ${conflict}`);
      } else {
        try {
          await addAmbassador(row);
          result.created++;
          seenCodes.add(codeKey(row.code));
          if (row.email) seenEmails.add(emailKey(row.email));
        } catch (error) {
          result.failed.push(`${row.name}: ${getErrMsg(error)}`);
        }
      }
      setImportDone(i + 1);
    }
    setImporting(false);
    setImportResult(result);
    if (result.created > 0) onAdded();
  }

  // Preview of what the import will skip, checked the same way the import itself does
  const importConflicts: string[] = [];
  if (importRows) {
    const emails = new Set(existingEmails);
    const codes = new Set(existingCodes);
    importRows.forEach((row) => {
      const conflict = conflictOf(row, emails, codes);
      importConflicts.push(conflict);
      if (!conflict) {
        codes.add(codeKey(row.code));
        if (row.email) emails.add(emailKey(row.email));
      }
    });
  }
  const skipCount = importConflicts.filter(Boolean).length;

  return (
    <>
      <Button onClick={() => fileInput.current?.click()} variant="outline">
        <UploadSimpleIcon /> Import CSV
      </Button>
      <Button onClick={() => setAddOpen(true)}>
        <PlusIcon weight="bold" /> Add ambassador
      </Button>
      <input
        ref={fileInput}
        type="file"
        accept=".csv,text/csv"
        hidden
        onChange={handleFileChosen}
      />

      <Dialog open={addOpen} onOpenChange={(open) => !open && handleAddClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add campus ambassador</DialogTitle>
            <DialogDescription>
              Use the email the ambassador signs in with, so they can get their referral links.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="ca-name">Name *</Label>
              <Input
                id="ca-name"
                autoFocus
                value={newAmbassador.name}
                onChange={setField('name')}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ca-code">Referral code *</Label>
              <Input
                id="ca-code"
                maxLength={8}
                className="uppercase"
                value={newAmbassador.code}
                onChange={setField('code')}
              />
              <p className="text-xs text-muted-foreground">8 letters or digits</p>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ca-email">Email</Label>
              <Input
                id="ca-email"
                type="email"
                value={newAmbassador.email}
                onChange={setField('email')}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ca-college">College</Label>
              <Input id="ca-college" value={newAmbassador.college} onChange={setField('college')} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ca-phone">Phone</Label>
              <Input id="ca-phone" value={newAmbassador.phone} onChange={setField('phone')} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleAddClose} disabled={adding}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={adding}>
              {adding && <Spinner />}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={importRows !== null} onOpenChange={(open) => !open && handleImportClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Import campus ambassadors</DialogTitle>
            <DialogDescription>
              {importResult
                ? `Added ${importResult.created} ambassador${importResult.created === 1 ? '' : 's'}.${
                    importResult.skipped.length > 0
                      ? ` Skipped ${importResult.skipped.length}.`
                      : ''
                  }${importResult.failed.length > 0 ? ` ${importResult.failed.length} failed.` : ''}`
                : `Found ${importRows?.length} ambassador${importRows?.length === 1 ? '' : 's'} in the file.${
                    skipCount > 0
                      ? ` ${skipCount} will be skipped because of the problem shown next to them.`
                      : ''
                  }`}
            </DialogDescription>
          </DialogHeader>

          {importResult ? (
            [...importResult.failed, ...importResult.skipped].length > 0 && (
              <ScrollArea className="max-h-52 rounded-lg border">
                <ul className="space-y-1 p-3 text-sm">
                  {importResult.failed.map((line) => (
                    <li key={`failed-${line}`} className="text-destructive">
                      Failed — {line}
                    </li>
                  ))}
                  {importResult.skipped.map((line) => (
                    <li key={`skipped-${line}`} className="text-muted-foreground">
                      Skipped — {line}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )
          ) : (
            <>
              <ScrollArea className="h-52 rounded-lg border">
                <ul className="space-y-1 p-3 text-sm">
                  {importRows?.map((row, i) => (
                    <li key={i}>
                      <span className="font-mono text-xs">{row.code || 'no code'}</span> —{' '}
                      {row.name}
                      {row.email && ` — ${row.email}`}
                      {row.college && ` — ${row.college}`}
                      {importConflicts[i] && (
                        <strong className="text-destructive"> (skip: {importConflicts[i]})</strong>
                      )}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
              {importing && <Progress value={(importDone / (importRows?.length || 1)) * 100} />}
            </>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleImportClose} disabled={importing}>
              {importResult ? 'Close' : 'Cancel'}
            </Button>
            {!importResult && (
              <Button onClick={handleImport} disabled={importing}>
                {importing && <Spinner />}
                {importing ? `Importing ${importDone}/${importRows?.length}` : 'Import'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
