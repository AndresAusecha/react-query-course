import * as React from 'react';


export const possibleStatus = [
  { id: "backlog", label: "Backlog" },
  { id: "todo", label: "To-do" },
  { id: "inProgress", label: "In Progress" },
  { id: "backlog", label: "Backlog" },
  { id: "done", label: "Done" },
  { id: "cancelled", label: "Cancelled" }
]


export function StatusSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="status-select"
    >
      {possibleStatus.map((status) => (
        <option value={status.id} key={status.id}>
          {status.label}
        </option>
      ))}
    </select>
  );
}
