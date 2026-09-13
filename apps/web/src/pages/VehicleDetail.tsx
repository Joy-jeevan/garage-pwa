import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { VehicleDetail } from "../types/vehicle";
import VehicleFormModal from "../components/vehicles/VehicleFormModal";

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showEdit, setShowEdit] = useState(false);

  const { data: vehicle, isLoading, error } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: () => api<VehicleDetail>(`/vehicles/${id}`),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => api(`/vehicles/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      navigate("/vehicles");
    },
  });

  if (isLoading) {
    return <div className="text-slate-400 text-sm">Loading...</div>;
  }

  if (error || !vehicle) {
    return (
      <div className="text-red-400 text-sm">
        Vehicle not found.{" "}
        <Link to="/vehicles" className="underline">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link to="/vehicles" className="hover:text-slate-200">
          Vehicles
        </Link>
        <span>/</span>
        <span className="text-slate-200">
          {vehicle.make} {vehicle.model}
        </span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {vehicle.make} {vehicle.model}
            {vehicle.year ? ` (${vehicle.year})` : ""}
          </h1>
          <p className="text-sky-400 font-mono text-lg mt-1">
            {vehicle.plateNumber}
          </p>
          <div className="mt-2 text-sm text-slate-400 space-y-0.5">
            {vehicle.color && <div>Color: {vehicle.color}</div>}
            {vehicle.vin && (
              <div className="font-mono text-xs">VIN: {vehicle.vin}</div>
            )}
            {vehicle.currentMileage != null && (
              <div>Mileage: {vehicle.currentMileage.toLocaleString()} km</div>
            )}
          </div>
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
              if (confirm("Soft-delete this vehicle?")) {
                deleteMutation.mutate();
              }
            }}
            className="rounded-md border border-red-900/50 text-red-400 px-3 py-1.5 text-sm hover:bg-red-950/50 transition"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Owner */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <div className="text-xs text-slate-500 mb-1">Owner</div>
        <Link
          to={`/customers/${vehicle.customer.id}`}
          className="font-medium text-sky-400 hover:underline"
        >
          {vehicle.customer.fullName}
        </Link>
        <div className="text-sm text-slate-400 font-mono">
          {vehicle.customer.mobile}
        </div>
      </section>

      {vehicle.notes && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-300">
          <div className="text-xs text-slate-500 mb-1">Notes</div>
          {vehicle.notes}
        </div>
      )}

      {/* Job history */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Service History</h2>
        {vehicle.jobCards.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-500">
            No job cards yet for this vehicle.
          </div>
        ) : (
          <div className="space-y-2">
            {vehicle.jobCards.map((j) => (
              <div
                key={j.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div>
                  <div className="font-medium text-sm">{j.jobNumber}</div>
                  {j.description && (
                    <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
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
        <VehicleFormModal
          vehicle={vehicle}
          onClose={() => setShowEdit(false)}
          onSuccess={() => {
            setShowEdit(false);
            queryClient.invalidateQueries({ queryKey: ["vehicle", id] });
            queryClient.invalidateQueries({ queryKey: ["vehicles"] });
          }}
        />
      )}
    </div>
  );
}
