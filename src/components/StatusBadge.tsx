import React from "react";
import { cn } from "@/lib/utils";

export type ProjectStatus =
  | "submitted"
  | "in_review"
  | "quoted"
  | "payment_pending"
  | "in_progress"
  | "delivered"
  | "revision_requested"
  | "completed"
  | "cancelled";

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

// Neutral chip; only the dot carries meaning, grouped by who needs to act.
const statusConfig: Record<ProjectStatus, { label: string; dot: string }> = {
  submitted: { label: "Submitted", dot: "bg-stone-400" },
  in_review: { label: "In review", dot: "bg-stone-400" },
  quoted: { label: "Quoted", dot: "bg-warning" },
  payment_pending: { label: "Payment pending", dot: "bg-warning" },
  in_progress: { label: "In progress", dot: "bg-text-primary" },
  delivered: { label: "Delivered", dot: "bg-success" },
  revision_requested: { label: "Revision requested", dot: "bg-danger" },
  completed: { label: "Completed", dot: "bg-success" },
  cancelled: { label: "Cancelled", dot: "bg-stone-300" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: "Unknown", dot: "bg-stone-300" };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-btn border border-border bg-surface px-2 py-0.5 text-xs font-medium text-text-secondary",
        status === "cancelled" && "text-text-muted",
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}

const paymentConfig: Record<string, { label: string; dot: string }> = {
  confirmed: { label: "Confirmed", dot: "bg-success" },
  rejected: { label: "Rejected", dot: "bg-danger" },
  pending: { label: "Pending review", dot: "bg-warning" },
};

export function PaymentStatusBadge({ status, className }: { status: string; className?: string }) {
  const config = paymentConfig[status] ?? paymentConfig.pending;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-btn border border-border bg-surface px-2 py-0.5 text-xs font-medium text-text-secondary",
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
