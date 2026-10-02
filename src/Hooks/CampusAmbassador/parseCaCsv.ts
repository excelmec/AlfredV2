export interface NewAmbassador {
  name: string;
  college: string;
  email: string;
  phone: string;
  /** Referral code chosen by the admin — 8 letters or digits. */
  code: string;
}

export const caCodePattern = /^[A-Za-z0-9]{8}$/;

/** Splits CSV text into rows of cells, honouring quoted cells with commas, quotes and newlines. */
function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

/** Header keywords for each field, e.g. "Full Name", "Email ID", "Referral Code". */
const headerMatchers: Record<keyof NewAmbassador, RegExp> = {
  code: /code|referral/i,
  email: /e-?mail/i,
  phone: /phone|mobile|contact|whatsapp/i,
  college: /college|institution|university|campus/i,
  name: /name/i,
};

/**
 * Reads ambassadors from a CSV with a header row (such as a Google Forms
 * export). Columns are found by header keyword, so their order and exact
 * wording do not matter; "Name" and "Code" columns are required.
 */
export function parseCaCsv(text: string): NewAmbassador[] {
  const [header, ...rows] = parseCsvRows(text.replace(/^﻿/, ''));
  if (!header) throw new Error('The file is empty');

  const columnIndex = {} as Record<keyof NewAmbassador, number>;
  // Checked in this order so "College Name" is taken as the college, not the name
  (['code', 'email', 'phone', 'college', 'name'] as const).forEach((field) => {
    columnIndex[field] = header.findIndex(
      (title, i) => headerMatchers[field].test(title) && !Object.values(columnIndex).includes(i),
    );
  });
  if (columnIndex.name === -1) {
    throw new Error('No "Name" column found. The first row must be a header row.');
  }
  if (columnIndex.code === -1) {
    throw new Error('No "Code" column found. Add a column with each ambassador\'s referral code.');
  }

  const cellOf = (row: string[], field: keyof NewAmbassador) =>
    columnIndex[field] === -1 ? '' : (row[columnIndex[field]] ?? '').trim();

  return rows
    .map((row) => ({
      name: cellOf(row, 'name'),
      college: cellOf(row, 'college'),
      email: cellOf(row, 'email'),
      phone: cellOf(row, 'phone'),
      code: cellOf(row, 'code').toUpperCase(),
    }))
    .filter((ambassador) => ambassador.name !== '');
}
