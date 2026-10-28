import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const SHEET_ID = process.env.GOOGLE_SHEETS_ID!;

function getAuth() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: SCOPES,
  });
  return auth;
}

export async function getSheets() {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  return sheets;
}

// ─── Generic Read/Write Helpers ────────────────────────────────────────────────

export async function readSheet(range: string): Promise<string[][]> {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range,
  });
  return (res.data.values as string[][]) || [];
}

export async function appendRow(sheet: string, values: (string | number | boolean)[]): Promise<void> {
  const sheets = await getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${sheet}!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [values] },
  });
}

export async function updateRow(
  sheet: string,
  rowIndex: number, // 1-based (row 1 = header)
  values: (string | number | boolean)[]
): Promise<void> {
  const sheets = await getSheets();
  const colCount = values.length;
  const endCol = String.fromCharCode(65 + colCount - 1);
  const range = `${sheet}!A${rowIndex + 1}:${endCol}${rowIndex + 1}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [values] },
  });
}

export async function deleteRow(sheet: string, rowIndex: number): Promise<void> {
  const sheets = await getSheets();
  // Get the sheet ID for the named sheet
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const sheetMeta = meta.data.sheets?.find(
    (s) => s.properties?.title === sheet
  );
  if (!sheetMeta?.properties?.sheetId) throw new Error(`Sheet "${sheet}" not found`);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetMeta.properties.sheetId,
              dimension: "ROWS",
              startIndex: rowIndex, // 0-based; row 0 = header, row 1 = first data row
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    },
  });
}

// ─── Sheet Initializer ──────────────────────────────────────────────────────────

export async function initializeSheets(): Promise<void> {
  const sheets = await getSheets();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const existingSheets = meta.data.sheets?.map((s) => s.properties?.title) || [];

  const requiredSheets = [
    { title: "categories", headers: ["id", "name", "description", "icon", "created_at"] },
    { title: "items", headers: ["id", "category_id", "name", "unit", "has_variants", "variant_config", "created_at"] },
    {
      title: "item_variants",
      headers: ["id", "item_id", "variant_label", "color", "size", "type", "grade", "brand", "pack_size", "current_stock", "min_threshold", "created_at"],
    },
    {
      title: "stock_logs",
      headers: ["id", "item_id", "variant_id", "item_name", "variant_label", "action_type", "quantity", "stock_before", "stock_after", "used_by_email", "used_by_name", "event", "notes", "created_at"],
    },
    { title: "events", headers: ["id", "name", "date", "description", "created_by", "created_at"] },
    { title: "users", headers: ["email", "name", "role", "profile_image", "last_login", "created_at"] },
  ];

  for (const s of requiredSheets) {
    if (!existingSheets.includes(s.title)) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          requests: [{ addSheet: { properties: { title: s.title } } }],
        },
      });
      await appendRow(s.title, s.headers);
    }
  }
}
