import type { ReactNode } from "react";

interface AdminTableProps {
  headers: string[];
  rows: ReactNode[][];
}

export function AdminTable({ headers, rows }: AdminTableProps) {
  return (
    <div className="overflow-hidden rounded-[var(--mh-radius-card)] border border-[rgba(148,163,184,0.14)] bg-[rgba(15,19,36,0.42)] backdrop-blur-xl">
      <table className="mh-admin-table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
