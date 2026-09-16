import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { JobCardListItem } from "../types/job-card";
import { STATUS_COLORS, STATUS_LABELS, ALL_STATUSES } from "../types/job-card";
import JobCardFormModal from "../components/job-cards/JobCardFormModal";

export default function JobCards() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showForm, setShowForm] = useState(false);

  const { data: jobs = [], isLoading, refetch } = useQuery({
    queryKey: ["job-cards", query, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (statusFilter) params.set("status", statusFilter);
      const qs = params.toString();
      return api<JobCardListItem[]>(`/job-cards${qs ? `?${qs}` : ""}`);
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
          <h1 className="text-2xl font-bold tracking-tight">Job Cards</h1>
          <p className="text-sm text-slate-400">
            Work orders · status tracking · labor & parts
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium hover:bg-brand-500 transition"
        >
          + New Job Card
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search job #, plate, customer, mobile..."
            className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          <button
            type="submit"
            className="rounded-md border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800 transition"
          >
            Search
          </button>
        </form>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-brand-500"
        >
          <option value="">All statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-slate-400 text-sm">Loading job cards...</div>
      ) : jobs.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center text-slate-400">
          {query || statusFilter
            ? "No job cards match your filters."
            : "No job cards yet. Create the first one."}
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((j) => (
            <Link
              key={j.id}
              to={`/job-cards/${j.id}`}
              className="block rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-700 transition"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold font-mono text-sm">
                      {j.jobNumber}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[j.status]}`}
                    >
                      {STATUS_LABELS[j.status]}
                    </span>
                    {j.priority !== "normal" && (
                      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs capitalize text-slate-300">
                        {j.priority}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-slate-300">
                    {j.vehicle.make} {j.vehicle.model} ·{" "}
                    <span className="font-mono text-brand-400">
                      {j.vehicle.plateNumber}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {j.customer.fullName} · {j.customer.mobile}
                  </div>
                  {j.description && (
                    <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {j.description}
                    </div>
                  )}
                </div>
                <div className="text-xs text-slate-500 space-y-0.5 sm:text-right shrink-0">
                  <div>{new Date(j.dateIn).toLocaleDateString()}</div>
                  {j.assignedMechanic && (
                    <div>{j.assignedMechanic.fullName}</div>
                  )}
                  <div>
                    {j._count.items} item{j._count.items !== 1 ? "s" : ""}
                    {j._count.images > 0 &&
                      ` · ${j._count.images} photo${j._count.images !== 1 ? "s" : ""}`}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showForm && (
        <JobCardFormModal
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
