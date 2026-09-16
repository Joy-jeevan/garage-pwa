export type JobStatus =
  | "draft"
  | "open"
  | "in_progress"
  | "waiting_parts"
  | "completed"
  | "invoiced"
  | "closed";

export type JobPriority = "low" | "normal" | "high" | "urgent";

export type JobCardListItem = {
  id: string;
  jobNumber: string;
  status: JobStatus;
  priority: JobPriority;
  description: string | null;
  dateIn: string;
  customer: { id: string; fullName: string; mobile: string };
  vehicle: {
    id: string;
    make: string;
    model: string;
    plateNumber: string;
  };
  assignedMechanic: { id: string; fullName: string } | null;
  _count: { items: number; images: number };
};

export type JobCardItem = {
  id: string;
  type: "labor" | "part" | "other";
  description: string;
  quantity: number | string;
  unitPrice: number | string;
  hours: number | string | null;
  partId: string | null;
};

export type JobCardDetail = {
  id: string;
  jobNumber: string;
  status: JobStatus;
  priority: JobPriority;
  description: string | null;
  dateIn: string;
  estimatedCompletion: string | null;
  completedAt: string | null;
  mileageIn: number | null;
  mileageOut: number | null;
  notes: string | null;
  customer: {
    id: string;
    fullName: string;
    mobile: string;
    email: string | null;
  };
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number | null;
    plateNumber: string;
    currentMileage: number | null;
  };
  assignedMechanic: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  items: JobCardItem[];
  images: Array<{
    id: string;
    category: "entry" | "exit";
    storagePath: string;
    fileName: string;
  }>;
};

export const STATUS_LABELS: Record<JobStatus, string> = {
  draft: "Draft",
  open: "Open",
  in_progress: "In Progress",
  waiting_parts: "Waiting Parts",
  completed: "Completed",
  invoiced: "Invoiced",
  closed: "Closed",
};

export const STATUS_COLORS: Record<JobStatus, string> = {
  draft: "bg-slate-700 text-slate-200",
  open: "bg-brand-600 text-white",
  in_progress: "bg-amber-500 text-slate-900",
  waiting_parts: "bg-orange-500 text-white",
  completed: "bg-emerald-500 text-white",
  invoiced: "bg-violet-500 text-white",
  closed: "bg-slate-600 text-slate-200",
};

export const ALL_STATUSES: JobStatus[] = [
  "draft",
  "open",
  "in_progress",
  "waiting_parts",
  "completed",
  "invoiced",
  "closed",
];
