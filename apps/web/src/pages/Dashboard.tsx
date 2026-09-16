import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { STATUS_COLORS, STATUS_LABELS } from "../types/job-card";
import type { JobStatus } from "../types/job-card";

type DashboardData = {
  stats: {
    openJobs: number;
    inProgressJobs: number;
    waitingPartsJobs: number;
    completedToday: number;
    customersCount: number;
    vehiclesCount: number;
  };
  recentJobs: Array<{
    id: string;
    jobNumber: string;
    status: JobStatus;
    dateIn: string;
    customer: { fullName: string; mobile: string };
    vehicle: { make: string; model: string; plateNumber: string };
  }>;
  unpaidInvoices: Array<{
    id: string;
    invoiceNumber: string;
    total: number | string;
    status: string;
    customer: { fullName: string };
  }>;
};

function StatCard({
  label,
  value,
  to,
  accent,
}: {
  label: string;
  value: number;
  to?: string;
  accent?: string;
}) {
  const content = (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-900/60 p-4 ${
        to ? "hover:border-slate-700 transition" : ""
      }`}
    >
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${accent || "text-slate-100"}`}>
        {value}
      </div>
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api<DashboardData>("/dashboard"),
    refetchInterval: 60_000,
  });

  if (isLoading || !data) {
    return <div className="text-slate-400 text-sm">Loading dashboard...</div>;
  }

  const { stats, recentJobs, unpaidInvoices } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-400">Today’s operational overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard
          label="Open"
          value={stats.openJobs}
          to="/job-cards?status=open"
          accent="text-brand-400"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgressJobs}
          to="/job-cards?status=in_progress"
          accent="text-amber-400"
        />
        <StatCard
          label="Waiting Parts"
          value={stats.waitingPartsJobs}
          to="/job-cards?status=waiting_parts"
          accent="text-orange-400"
        />
        <StatCard
          label="Completed today"
          value={stats.completedToday}
          accent="text-emerald-400"
        />
        <StatCard label="Customers" value={stats.customersCount} to="/customers" />
        <StatCard label="Vehicles" value={stats.vehiclesCount} to="/vehicles" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent jobs */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Recent Job Cards</h2>
            <Link to="/job-cards" className="text-sm text-brand-400 hover:underline">
              View all
            </Link>
          </div>
          {recentJobs.length === 0 ? (
            <div className="rounded-xl border border-slate-800 p-4 text-sm text-slate-500">
              No jobs yet.
            </div>
          ) : (
            <div className="space-y-2">
              {recentJobs.map((j) => (
                <Link
                  key={j.id}
                  to={`/job-cards/${j.id}`}
                  className="block rounded-xl border border-slate-800 bg-slate-900/60 p-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm">{j.jobNumber}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${STATUS_COLORS[j.status]}`}
                    >
                      {STATUS_LABELS[j.status]}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {j.vehicle.make} {j.vehicle.model} · {j.vehicle.plateNumber}
                  </div>
                  <div className="text-xs text-slate-500">
                    {j.customer.fullName}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Unpaid invoices */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Unpaid Invoices</h2>
            <Link to="/invoices" className="text-sm text-brand-400 hover:underline">
              View all
            </Link>
          </div>
          {unpaidInvoices.length === 0 ? (
            <div className="rounded-xl border border-slate-800 p-4 text-sm text-slate-500">
              No unpaid invoices.
            </div>
          ) : (
            <div className="space-y-2">
              {unpaidInvoices.map((inv) => (
                <Link
                  key={inv.id}
                  to={`/invoices/${inv.id}`}
                  className="block rounded-xl border border-slate-800 bg-slate-900/60 p-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">{inv.invoiceNumber}</span>
                    <span className="font-medium">
                      {Number(inv.total).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {inv.customer.fullName} · {inv.status}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Quick actions */}
      <section className="flex flex-wrap gap-2">
        <Link
          to="/job-cards"
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium hover:bg-brand-500 transition"
        >
          + New Job
        </Link>
        <Link
          to="/customers"
          className="rounded-md border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800 transition"
        >
          + Customer
        </Link>
        <Link
          to="/vehicles"
          className="rounded-md border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800 transition"
        >
          + Vehicle
        </Link>
      </section>
    </div>
  );
}
