export const APP_NAME = "Garage Manager";
export const APP_DESCRIPTION = "Vehicle Garage Services Management";

export const USER_ROLES = ["admin", "manager", "mechanic"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const JOB_STATUSES = [
  "draft",
  "open",
  "in_progress",
  "waiting_parts",
  "completed",
  "invoiced",
  "closed",
] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const JOB_PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export type JobPriority = (typeof JOB_PRIORITIES)[number];

export const IMAGE_CATEGORIES = ["entry", "exit"] as const;
export type ImageCategory = (typeof IMAGE_CATEGORIES)[number];

export const PAYMENT_METHODS = [
  "cash",
  "card",
  "upi",
  "bank_transfer",
  "other",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
