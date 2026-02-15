'use server';

import fs from 'fs';
import Papa from 'papaparse';
import path from 'path';

interface CountryRow {
  country: string;
  name: string;
}

export async function getCountryName(
  countryCode: string
): Promise<string | null> {
  const csvPath = path.join(
    process.cwd(),
    'public',
    'datasets',
    'countries.csv'
  );
  const csvContent = fs.readFileSync(csvPath, 'utf-8');

  const result = Papa.parse<CountryRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  const country = result.data.find(
    row => row.country === countryCode.toUpperCase()
  );

  return country?.name || null;
}
