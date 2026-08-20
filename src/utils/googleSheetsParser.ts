import { Student, Gender } from '../types';

export interface ParsedRosterResult {
  students: Student[];
  detectedClassName?: string;
  totalParsed: number;
  warnings: string[];
}

/**
 * Extracts the Google Spreadsheet ID and GID (Sheet Tab ID) from various Google Sheets URL formats.
 */
export function extractGoogleSheetId(url: string): { sheetId: string | null; gid: string | null } {
  try {
    const cleanUrl = url.trim();

    // Standard pattern: /d/([a-zA-Z0-9-_]+)
    const idMatch = cleanUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const sheetId = idMatch ? idMatch[1] : null;

    // GID pattern: gid=([0-9]+)
    const gidMatch = cleanUrl.match(/[#&?]gid=([0-9]+)/);
    const gid = gidMatch ? gidMatch[1] : null;

    return { sheetId, gid };
  } catch (err) {
    return { sheetId: null, gid: null };
  }
}

/**
 * Generates the CSV export endpoint URL for a given Google Sheet.
 */
export function getGoogleSheetCsvUrl(sheetId: string, gid?: string | null): string {
  if (gid) {
    return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
  }
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
}

/**
 * Normalize gender string to '남' | '여'
 */
export function normalizeGender(val: string): Gender {
  const clean = val.trim().toLowerCase();
  if (
    clean === '남' ||
    clean === '남자' ||
    clean === '남학생' ||
    clean === 'm' ||
    clean === 'male' ||
    clean === '1' ||
    clean.includes('남')
  ) {
    return '남';
  }
  return '여';
}

/**
 * Parses CSV/TSV text into rows of columns safely respecting quotes.
 */
export function parseDelimitedText(rawText: string): string[][] {
  const lines = rawText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const rows: string[][] = [];

  for (const line of lines) {
    // Detect delimiter: tab or comma
    const hasTabs = line.includes('\t');
    if (hasTabs) {
      rows.push(line.split('\t').map((c) => c.replace(/^["']|["']$/g, '').trim()));
      continue;
    }

    // CSV parsing with quote handling
    const cols: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cols.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    cols.push(cur.trim());
    rows.push(cols.map((c) => c.replace(/^["']|["']$/g, '').trim()));
  }

  return rows;
}

/**
 * Automatically inspects headers or content structure to build Student records.
 */
export function parseStudentRosterFromRows(rows: string[][]): ParsedRosterResult {
  const warnings: string[] = [];
  if (rows.length === 0) {
    return { students: [], totalParsed: 0, warnings: ['입력된 데이터가 비어 있습니다.'] };
  }

  // Check if first row is a header
  const firstRow = rows[0].map((c) => c.toLowerCase());
  let numColIdx = -1;
  let nameColIdx = -1;
  let genderColIdx = -1;
  let classColIdx = -1;

  firstRow.forEach((col, idx) => {
    if (col.includes('번호') || col === 'no' || col === 'num' || col === '순번' || col === '#') {
      numColIdx = idx;
    } else if (col.includes('이름') || col.includes('성명') || col === 'name' || col.includes('학생')) {
      nameColIdx = idx;
    } else if (col.includes('성별') || col === '성' || col.includes('남여') || col === 'gender' || col === 'sex') {
      genderColIdx = idx;
    } else if (col.includes('학급') || col.includes('반') || col.includes('class')) {
      classColIdx = idx;
    }
  });

  const isHeaderPresent = numColIdx !== -1 || nameColIdx !== -1 || genderColIdx !== -1;
  const dataRows = isHeaderPresent ? rows.slice(1) : rows;

  // If header wasn't detected by keywords, infer columns by heuristics
  if (nameColIdx === -1 && rows.length > 0) {
    const sampleRow = dataRows[0] || rows[0];
    sampleRow.forEach((val, idx) => {
      const isNum = /^\d+$/.test(val);
      const isGend = /^(남|여|남자|여자|m|f|남학생|여학생)$/i.test(val);
      if (isNum && numColIdx === -1) {
        numColIdx = idx;
      } else if (isGend && genderColIdx === -1) {
        genderColIdx = idx;
      } else if (!isNum && !isGend && nameColIdx === -1 && val.length >= 1) {
        nameColIdx = idx;
      }
    });
  }

  // Fallback defaults if still not found
  if (nameColIdx === -1) nameColIdx = 1 < (dataRows[0]?.length || 0) ? 1 : 0;
  if (numColIdx === -1) numColIdx = nameColIdx === 1 ? 0 : -1;
  if (genderColIdx === -1) genderColIdx = nameColIdx === 1 ? 2 : 1;

  const students: Student[] = [];
  let detectedClassName: string | undefined;

  dataRows.forEach((row, i) => {
    if (!row || row.length === 0) return;

    const rawName = row[nameColIdx] || '';
    const cleanName = rawName
      .replace(/^\d+[\.\s\-\)]*/, '') // remove "1. " from name if merged
      .replace(/[\(\[\{]?(남|여|남자|여자|M|F)[\)\]\}]?/gi, '')
      .trim();

    if (!cleanName) return;

    // Number
    let number = i + 1;
    if (numColIdx !== -1 && row[numColIdx]) {
      const parsedNum = parseInt(row[numColIdx], 10);
      if (!isNaN(parsedNum)) {
        number = parsedNum;
      }
    }

    // Gender
    let gender: Gender = '남';
    if (genderColIdx !== -1 && row[genderColIdx]) {
      gender = normalizeGender(row[genderColIdx]);
    } else {
      // Check if gender was embedded in raw text
      if (rawName.includes('여') || rawName.toLowerCase().includes('f') || rawName.includes('girl')) {
        gender = '여';
      } else {
        gender = number % 2 === 0 ? '여' : '남';
      }
    }

    // Class Name if present
    if (classColIdx !== -1 && row[classColIdx] && !detectedClassName) {
      detectedClassName = row[classColIdx];
    }

    students.push({
      id: `std-${Date.now()}-${number}-${Math.random().toString(36).substr(2, 4)}`,
      number,
      name: cleanName,
      gender,
      grade: 3,
      classNum: 1,
    });
  });

  // Sort by student number
  students.sort((a, b) => (a.number || 0) - (b.number || 0));

  return {
    students,
    detectedClassName,
    totalParsed: students.length,
    warnings,
  };
}

/**
 * Fetches and parses a Google Sheet from its public URL.
 */
export async function fetchGoogleSheetRoster(url: string): Promise<ParsedRosterResult> {
  const { sheetId, gid } = extractGoogleSheetId(url);
  if (!sheetId) {
    throw new Error('올바른 구글 스프레드시트 주소가 아닙니다. URL에 "/d/스프레드시트ID" 형태가 포함되어야 합니다.');
  }

  const csvExportUrl = getGoogleSheetCsvUrl(sheetId, gid);

  try {
    const response = await fetch(csvExportUrl, {
      method: 'GET',
      headers: {
        Accept: 'text/csv, text/plain, */*',
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403 || response.status === 404) {
        throw new Error(
          '구글 시트에 접근할 수 없습니다. 구글 시트의 [공유] 버튼에서 "링크가 있는 모든 사용자(뷰어)"로 설정되어 있는지 확인해주세요.'
        );
      }
      throw new Error(`구글 시트 요청 오류 (상태 코드: ${response.status})`);
    }

    const csvText = await response.text();
    if (csvText.includes('<!DOCTYPE html>') || csvText.includes('<html')) {
      throw new Error(
        '구글 시트 로그인 화면이 반환되었습니다. 구글 시트 [공유] 설정에서 "링크가 있는 모든 사용자에게 공개"로 변경해주세요.'
      );
    }

    const rows = parseDelimitedText(csvText);
    const parsed = parseStudentRosterFromRows(rows);

    if (parsed.students.length === 0) {
      throw new Error('구글 시트에서 학생 정보를 찾을 수 없습니다. [번호, 이름, 성별] 열이 있는지 확인해주세요.');
    }

    return parsed;
  } catch (err: any) {
    // If standard fetch fails (CORS or network), throw helpful explanation
    throw new Error(err.message || '구글 시트 데이터를 가져오는데 실패했습니다.');
  }
}
