import { z } from "zod";
import {
  JOB_PRIORITIES,
  JOB_STATUSES,
  IMAGE_CATEGORIES,
  PAYMENT_METHODS,
  USER_ROLES,
} from "./constants";

// ======================
// Auth
// ======================
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
  fullName: z.string().min(1, "Full name is required").max(200),
  phone: z.string().max(20).optional(),
  role: z.enum(USER_ROLES).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ======================
// Customer
// ======================
export const createCustomerSchema = z.object({
  fullName: z.string().min(1, "Name is required").max(200),
  mobile: z
    .string()
    .min(8, "Mobile number is too short")
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "Invalid mobile number format"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

// ======================
// Vehicle
// ======================
export const createVehicleSchema = z.object({
  customerId: z.string().min(1),
  make: z.string().min(1, "Make is required").max(100),
  model: z.string().min(1, "Model is required").max(100),
  year: z.number().int().min(1900).max(2100).optional(),
  plateNumber: z.string().min(1, "Plate number is required").max(30),
  vin: z.string().max(50).optional(),
  color: z.string().max(50).optional(),
  currentMileage: z.number().int().min(0).optional(),
  notes: z.string().max(2000).optional(),
});

export const updateVehicleSchema = createVehicleSchema
  .partial()
  .omit({ customerId: true });

// ======================
// Job Card
// ======================
export const createJobCardSchema = z.object({
  customerId: z.string().min(1),
  vehicleId: z.string().min(1),
  description: z.string().max(2000).optional(),
  priority: z.enum(JOB_PRIORITIES).default("normal"),
  estimatedCompletion: z.string().datetime().optional(),
  mileageIn: z.number().int().min(0).optional(),
  assignedMechanicId: z.string().optional(),
  notes: z.string().max(2000).optional(),
});

export const updateJobCardStatusSchema = z.object({
  status: z.enum(JOB_STATUSES),
});

// ======================
// Job Card Item
// ======================
export const createJobCardItemSchema = z.object({
  type: z.enum(["labor", "part", "other"]),
  description: z.string().min(1).max(300),
  quantity: z.number().positive().default(1),
  unitPrice: z.number().min(0),
  partId: z.string().optional(),
  hours: z.number().positive().optional(),
});

// ======================
// Image
// ======================
export const createJobCardImageSchema = z.object({
  category: z.enum(IMAGE_CATEGORIES),
  storagePath: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive().optional(),
  caption: z.string().max(500).optional(),
});

// ======================
// Part
// ======================
export const createPartSchema = z.object({
  name: z.string().min(1).max(200),
  sku: z.string().max(50).optional(),
  quantityOnHand: z.number().min(0).default(0),
  unitCost: z.number().min(0).default(0),
  sellingPrice: z.number().min(0).default(0),
  minStockLevel: z.number().min(0).default(0),
  notes: z.string().max(1000).optional(),
});


// ======================
// Job Card update (partial)
// ======================
export const updateJobCardSchema = z.object({
  description: z.string().max(2000).optional(),
  priority: z.enum(JOB_PRIORITIES).optional(),
  estimatedCompletion: z.string().datetime().optional().nullable(),
  mileageIn: z.number().int().min(0).optional().nullable(),
  mileageOut: z.number().int().min(0).optional().nullable(),
  assignedMechanicId: z.string().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  status: z.enum(JOB_STATUSES).optional(),
});


// ======================
// Invoice
// ======================
export const createInvoiceSchema = z.object({
  jobCardId: z.string().min(1),
  taxAmount: z.number().min(0).default(0),
  notes: z.string().max(2000).optional(),
});

export const recordPaymentSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(PAYMENT_METHODS),
  reference: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

export const updateInvoiceStatusSchema = z.object({
  status: z.enum(["draft", "sent", "paid", "cancelled"]),
});

// ======================
// Auth / User role
// ======================
export const userRoleSchema = z.enum(USER_ROLES);
