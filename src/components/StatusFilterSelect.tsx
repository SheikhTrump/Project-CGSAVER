"use client";

interface StatusFilterSelectProps {
  defaultValue: string;
  query: string;
}

const statuses = [
  { value: "all", label: "All Statuses" },
  { value: "submitted", label: "Submitted (Needs Quote)" },
  { value: "in_review", label: "In Review" },
  { value: "quoted", label: "Quoted" },
  { value: "payment_pending", label: "Payment Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "delivered", label: "Delivered" },
  { value: "revision_requested", label: "Revision" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function StatusFilterSelect({ defaultValue, query }: StatusFilterSelectProps) {
  return (
    <form className="w-full sm:w-auto flex items-center gap-2">
      <input type="hidden" name="query" value={query} />
      <select
        name="status"
        defaultValue={defaultValue}
        onChange={(e) => e.target.form?.submit()}
        className="flex h-10 w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      >
        {statuses.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </form>
  );
}
