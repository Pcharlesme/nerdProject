interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number;
}

/** Builds a CSV file from rows and triggers a browser download — no backend involved. */
export function downloadCsv<T>(filename: string, rows: T[], columns: CsvColumn<T>[]) {
  const escape = (cell: string | number) => {
    const text = String(cell);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const lines = [
    columns.map((col) => escape(col.header)).join(","),
    ...rows.map((row) => columns.map((col) => escape(col.value(row))).join(",")),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
