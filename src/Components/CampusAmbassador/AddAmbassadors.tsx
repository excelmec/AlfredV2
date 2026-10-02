import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  Stack,
  TextField,
} from '@mui/material';
import { ChangeEvent, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { getErrMsg } from 'Hooks/errorParser';
import { CaListRes } from 'Hooks/CampusAmbassador/useCaList';
import { NewAmbassador, caCodePattern, parseCaCsv } from 'Hooks/CampusAmbassador/parseCaCsv';

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
      <Stack direction="row" spacing={2}>
        <Button onClick={() => setAddOpen(true)} variant="contained">
          Add Ambassador
        </Button>
        <Button onClick={() => fileInput.current?.click()} variant="outlined">
          Import CSV
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept=".csv,text/csv"
          hidden
          onChange={handleFileChosen}
        />
      </Stack>

      <Dialog open={addOpen} onClose={handleAddClose} fullWidth maxWidth="xs">
        <DialogTitle>Add Campus Ambassador</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Use the email the ambassador signs in with, so they can get their referral links.
          </DialogContentText>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Name"
              required
              autoFocus
              value={newAmbassador.name}
              onChange={setField('name')}
            />
            <TextField
              label="Referral Code"
              required
              helperText="8 letters or digits"
              inputProps={{ maxLength: 8, style: { textTransform: 'uppercase' } }}
              value={newAmbassador.code}
              onChange={setField('code')}
            />
            <TextField
              label="Email"
              type="email"
              value={newAmbassador.email}
              onChange={setField('email')}
            />
            <TextField
              label="College"
              value={newAmbassador.college}
              onChange={setField('college')}
            />
            <TextField label="Phone" value={newAmbassador.phone} onChange={setField('phone')} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAdd} disabled={adding}>
            Add
          </Button>
          <Button onClick={handleAddClose} disabled={adding}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={importRows !== null} onClose={handleImportClose} fullWidth maxWidth="sm">
        <DialogTitle>Import Campus Ambassadors</DialogTitle>
        <DialogContent>
          {importResult ? (
            <>
              <DialogContentText>
                Added {importResult.created} ambassador{importResult.created === 1 ? '' : 's'}.
                {importResult.skipped.length > 0 && ` Skipped ${importResult.skipped.length}.`}
                {importResult.failed.length > 0 && ` ${importResult.failed.length} failed.`}
              </DialogContentText>
              {[...importResult.failed, ...importResult.skipped].length > 0 && (
                <Box
                  component="ul"
                  sx={{ maxHeight: 200, overflowY: 'auto', pl: 3, fontSize: '0.85rem' }}
                >
                  {importResult.failed.map((line) => (
                    <li key={`failed-${line}`}>Failed — {line}</li>
                  ))}
                  {importResult.skipped.map((line) => (
                    <li key={`skipped-${line}`}>Skipped — {line}</li>
                  ))}
                </Box>
              )}
            </>
          ) : (
            <>
              <DialogContentText>
                Found {importRows?.length} ambassador{importRows?.length === 1 ? '' : 's'} in the
                file.
                {skipCount > 0 &&
                  ` ${skipCount} will be skipped because of the problem shown next to them.`}
              </DialogContentText>
              <Box
                component="ul"
                sx={{ maxHeight: 200, overflowY: 'auto', pl: 3, fontSize: '0.85rem' }}
              >
                {importRows?.map((row, i) => (
                  <li key={i}>
                    {row.code || 'no code'} — {row.name}
                    {row.email && ` — ${row.email}`}
                    {row.college && ` — ${row.college}`}
                    {importConflicts[i] && <strong> (skip: {importConflicts[i]})</strong>}
                  </li>
                ))}
              </Box>
              {importing && (
                <LinearProgress
                  variant="determinate"
                  value={(importDone / (importRows?.length || 1)) * 100}
                />
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          {!importResult && (
            <Button onClick={handleImport} disabled={importing}>
              {importing ? `Importing ${importDone}/${importRows?.length}` : 'Import'}
            </Button>
          )}
          <Button onClick={handleImportClose} disabled={importing}>
            {importResult ? 'Close' : 'Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
