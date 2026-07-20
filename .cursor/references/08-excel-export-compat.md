# Excel export compatibility

Existing workbooks live in `teaching/attendance/`:

- `attendance-inf231.xlsx`
- `attendance-inf232.xlsx`
- `attendance-template.xlsx`

Sheets: `midterms` (weeks 1–7), `finals` (weeks 8–14), `all` (rollup), `summary` (analytics).

## MVP export (keep simple)

Produce a flat export the teacher can copy from:

| studentId | studentName | date | weekday | code | source | checkedInAt |
|-----------|-------------|------|---------|------|--------|-------------|

Plus a **pivot-friendly** sheet: rows = students (roster order), columns = meeting dates, values = `0–4` or blank.

## Mapping rules

- Only export meetings that were **opened** (or manually marked).
- Unopened dates → blank (not `0`).
- Codes must be numeric `0–4`.
- Roster order: follow imported classlist order (teacher may reorder later in Excel).
- Section file naming: `attendance-export-INF231MWA-YYYYMMDD.xlsx`

## Later (Phase 3)

Write directly into `midterms` / `finals` date columns by matching date headers (`Wednesday, July 22, 2026` style).
