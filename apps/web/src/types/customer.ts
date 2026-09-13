export type VehicleSummary = {
  id: string;
  make: string;
  model: string;
  year: number | null;
  plateNumber: string;
};

export type Customer = {
  id: string;
  fullName: string;
  mobile: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  vehicles?: VehicleSummary[];
  _count?: { jobCards: number };
};

export type CustomerDetail = Customer & {
  vehicles: VehicleSummary[];
  jobCards: Array<{
    id: string;
    jobNumber: string;
    status: string;
    dateIn: string;
    description: string | null;
    vehicle: {
      make: string;
      model: string;
      plateNumber: string;
    };
  }>;
};
