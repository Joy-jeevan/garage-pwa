export type VehicleCustomer = {
  id: string;
  fullName: string;
  mobile: string;
  email?: string | null;
};

export type Vehicle = {
  id: string;
  customerId: string;
  make: string;
  model: string;
  year: number | null;
  plateNumber: string;
  vin: string | null;
  color: string | null;
  currentMileage: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: VehicleCustomer;
  _count?: { jobCards: number };
};

export type VehicleDetail = Vehicle & {
  customer: VehicleCustomer;
  jobCards: Array<{
    id: string;
    jobNumber: string;
    status: string;
    dateIn: string;
    description: string | null;
    priority: string;
  }>;
};
