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

const statusConfig: Record<
  ProjectStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  submitted: {
    label: "Submitted",
    bg: "bg-slate-100",
    text: "text-slate-500",
    dot: "bg-slate-500",
  },
  in_review: {
    label: "In Review",
    bg: "bg-blue-50",
    text: "text-blue-500",
    dot: "bg-blue-500",
  },
  quoted: {
    label: "Quoted",
    bg: "bg-purple-50",
    text: "text-purple-600",
    dot: "bg-purple-600",
  },
  payment_pending: {
    label: "Payment Pending",
    bg: "bg-orange-50",
    text: "text-orange-500",
    dot: "bg-orange-500",
  },
  in_progress: {
    label: "In Progress",
    bg: "bg-amber-50",
    text: "text-amber-500",
    dot: "bg-amber-500",
  },
  delivered: {
    label: "Delivered",
    bg: "bg-teal-50",
    text: "text-teal-500",
    dot: "bg-teal-500",
  },
  revision_requested: {
    label: "Revision Requested",
    bg: "bg-red-50",
    text: "text-red-500",
    dot: "bg-red-500",
  },
  completed: {
    label: "Completed",
    bg: "bg-green-50",
    text: "text-green-500",
    dot: "bg-green-500",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-slate-100",
    text: "text-slate-400",
    dot: "bg-slate-400",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  // Fallback if an unknown status is passed
  if (!config) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-500",
          className
        )}
      >
        <div className="h-1.5 w-1.5 rounded-full bg-slate-500" />
        Unknown
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        config.bg,
        config.text,
        className
      )}
    >
      <div className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
