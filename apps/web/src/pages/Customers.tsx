import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Customer } from "../types/customer";
import CustomerFormModal from "../components/customers/CustomerFormModal";

export default function Customers() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: customers = [], isLoading, refetch } = useQuery({
    queryKey: ["customers", query],
    queryFn: () => {
      const params = new URLSearchParams();
      if (query) {
        // Prefer mobile search if it looks like a number
        if (/^[0-9+\-\s()]+$/.test(query)) {
          params.set("mobile", query);
        } else {
          params.set("q", query);
        }
      }
      const qs = params.toString();
      return api<Customer[]>(`/customers${qs ? `?${qs}` : ""}`);
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
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-slate-400">
            Search by mobile number to quickly find a customer and their vehicles
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium hover:bg-sky-500 transition"
        >
          + New Customer
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by mobile or name..."
          className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
        />
        <button
          type="submit"
          className="rounded-md border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800 transition"
        >
          Search
        </button>
      </form>

      {/* List */}
      {isLoading ? (
        <div className="text-slate-400 text-sm">Loading customers...</div>
      ) : customers.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center text-slate-400">
          {query
            ? "No customers found for this search."
            : "No customers yet. Create the first one."}
        </div>
      ) : (
        <div className="space-y-3">
          {customers.map((c) => (
            <Link
              key={c.id}
              to={`/customers/${c.id}`}
              className="block rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-700 transition"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="font-medium text-slate-100">{c.fullName}</div>
                  <div className="text-sm text-sky-400 font-mono">{c.mobile}</div>
                  {c.email && (
                    <div className="text-xs text-slate-500 mt-0.5">{c.email}</div>
                  )}
                </div>
                <div className="text-xs text-slate-500 space-y-0.5 sm:text-right">
                  <div>
                    {c.vehicles?.length ?? 0} vehicle
                    {(c.vehicles?.length ?? 0) !== 1 ? "s" : ""}
                  </div>
                  <div>
                    {c._count?.jobCards ?? 0} job
                    {(c._count?.jobCards ?? 0) !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              {c.vehicles && c.vehicles.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {c.vehicles.slice(0, 4).map((v) => (
                    <span
                      key={v.id}
                      className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300"
                    >
                      {v.make} {v.model} · {v.plateNumber}
                    </span>
                  ))}
                  {c.vehicles.length > 4 && (
                    <span className="text-xs text-slate-500">
                      +{c.vehicles.length - 4} more
                    </span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {showForm && (
        <CustomerFormModal
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
