import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { CustomerDetail } from "../types/customer";
import CustomerFormModal from "../components/customers/CustomerFormModal";
import VehicleFormModal from "../components/vehicles/VehicleFormModal";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showEdit, setShowEdit] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);

  const { data: customer, isLoading, error } = useQuery({
    queryKey: ["customer", id],
    queryFn: () => api<CustomerDetail>(`/customers/${id}`),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => api(`/customers/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      navigate("/customers");
    },
  });

  if (isLoading) {
    return <div className="text-slate-400 text-sm">Loading...</div>;
  }

  if (error || !customer) {
    return (
      <div className="text-red-400 text-sm">
        Customer not found.{" "}
        <Link to="/customers" className="underline">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link to="/customers" className="hover:text-slate-200">
          Customers
        </Link>
        <span>/</span>
        <span className="text-slate-200">{customer.fullName}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {customer.fullName}
          </h1>
          <p className="text-brand-400 font-mono text-lg mt-1">{customer.mobile}</p>
          {customer.email && (
            <p className="text-sm text-slate-400 mt-0.5">{customer.email}</p>
          )}
          {customer.address && (
            <p className="text-sm text-slate-500 mt-1">{customer.address}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowEdit(true)}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-800 transition"
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (confirm("Soft-delete this customer?")) {
                deleteMutation.mutate();
              }
            }}
            className="rounded-md border border-red-900/50 text-red-400 px-3 py-1.5 text-sm hover:bg-red-950/50 transition"
          >
            Delete
          </button>
        </div>
      </div>

      {customer.notes && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-300">
          <div className="text-xs text-slate-500 mb-1">Notes</div>
          {customer.notes}
        </div>
      )}

      {/* Vehicles */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Vehicles</h2>
          <button
            onClick={() => setShowVehicleForm(true)}
            className="text-sm text-brand-400 hover:underline"
          >
            + Add vehicle
          </button>
        </div>
        {customer.vehicles.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-500">
            No vehicles linked yet.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {customer.vehicles.map((v) => (
              <Link
                key={v.id}
                to={`/vehicles/${v.id}`}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-700 transition block"
              >
                <div className="font-medium">
                  {v.make} {v.model}
                  {v.year ? ` (${v.year})` : ""}
                </div>
                <div className="text-sm text-slate-400 font-mono mt-0.5">
                  {v.plateNumber}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent jobs */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Recent Job Cards</h2>
        {customer.jobCards.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-500">
            No job cards yet.
          </div>
        ) : (
          <div className="space-y-2">
            {customer.jobCards.map((j) => (
              <div
                key={j.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div>
                  <div className="font-medium text-sm">{j.jobNumber}</div>
                  <div className="text-xs text-slate-400">
                    {j.vehicle.make} {j.vehicle.model} · {j.vehicle.plateNumber}
                  </div>
                  {j.description && (
                    <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {j.description}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="rounded-full bg-slate-800 px-2.5 py-0.5 capitalize">
                    {j.status.replace("_", " ")}
                  </span>
                  <span className="text-slate-500">
                    {new Date(j.dateIn).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showEdit && (
        <CustomerFormModal
          customer={customer}
          onClose={() => setShowEdit(false)}
          onSuccess={() => {
            setShowEdit(false);
            queryClient.invalidateQueries({ queryKey: ["customer", id] });
            queryClient.invalidateQueries({ queryKey: ["customers"] });
          }}
        />
      )}

      {showVehicleForm && (
        <VehicleFormModal
          defaultCustomerId={customer.id}
          onClose={() => setShowVehicleForm(false)}
          onSuccess={() => {
            setShowVehicleForm(false);
            queryClient.invalidateQueries({ queryKey: ["customer", id] });
            queryClient.invalidateQueries({ queryKey: ["vehicles"] });
          }}
        />
      )}
    </div>
  );
}
