import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Vehicle } from "../types/vehicle";
import VehicleFormModal from "../components/vehicles/VehicleFormModal";

export default function Vehicles() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: vehicles = [], isLoading, refetch } = useQuery({
    queryKey: ["vehicles", query],
    queryFn: () => {
      const params = new URLSearchParams();
      if (query) {
        // Prefer plate search if it looks like a plate
        if (/^[A-Za-z0-9\-\s]+$/.test(query) && query.length <= 15) {
          params.set("plate", query);
        } else {
          params.set("q", query);
        }
      }
      const qs = params.toString();
      return api<Vehicle[]>(`/vehicles${qs ? `?${qs}` : ""}`);
    },
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setQuery(search.trim());
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vehicles</h1>
          <p className="text-sm text-slate-400">
            Search by plate number, make, model, or customer
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium hover:bg-sky-500 transition"
        >
          + New Vehicle
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by plate, make, model, or customer..."
          className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
        />
        <button
          type="submit"
          className="rounded-md border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800 transition"
        >
          Search
        </button>
      </form>

      {isLoading ? (
        <div className="text-slate-400 text-sm">Loading vehicles...</div>
      ) : vehicles.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center text-slate-400">
          {query
            ? "No vehicles found for this search."
            : "No vehicles yet. Add the first one."}
        </div>
      ) : (
        <div className="space-y-3">
          {vehicles.map((v) => (
            <Link
              key={v.id}
              to={`/vehicles/${v.id}`}
              className="block rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-700 transition"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="font-medium text-slate-100">
                    {v.make} {v.model}
                    {v.year ? ` (${v.year})` : ""}
                  </div>
                  <div className="text-sm text-sky-400 font-mono mt-0.5">
                    {v.plateNumber}
                  </div>
                  {v.customer && (
                    <div className="text-xs text-slate-400 mt-1">
                      {v.customer.fullName} · {v.customer.mobile}
                    </div>
                  )}
                </div>
                <div className="text-xs text-slate-500 space-y-0.5 sm:text-right">
                  {v.color && <div>{v.color}</div>}
                  {v.currentMileage != null && (
                    <div>{v.currentMileage.toLocaleString()} km</div>
                  )}
                  <div>
                    {v._count?.jobCards ?? 0} job
                    {(v._count?.jobCards ?? 0) !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showForm && (
        <VehicleFormModal
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
