import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

type InvoiceListItem = {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number | string;
  issuedAt: string | null;
  customer: { id: string; fullName: string; mobile: string };
  jobCard: {
    id: string;
    jobNumber: string;
    vehicle: { make: string; model: string; plateNumber: string };
  };
};

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-slate-700",
  sent: "bg-brand-600",
  paid: "bg-emerald-500",
  cancelled: "bg-red-900/50 text-red-300",
};

export default function Invoices() {
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => api<InvoiceListItem[]>("/invoices"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
        <p className="text-sm text-slate-400">
          Generated from completed job cards
        </p>
      </div>

      {isLoading ? (
        <div className="text-slate-400 text-sm">Loading...</div>
      ) : invoices.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center text-slate-400">
          No invoices yet. Complete a job card and generate an invoice from its
          detail page.
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <Link
              key={inv.id}
              to={`/invoices/${inv.id}`}
              className="block rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-700 transition"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium">
                      {inv.invoiceNumber}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs capitalize ${STATUS_STYLE[inv.status] || "bg-slate-700"}`}
                    >
                      {inv.status}
                    </span>
                  </div>
                  <div className="text-sm text-slate-400 mt-0.5">
                    {inv.customer.fullName} · {inv.jobCard.jobNumber}
                  </div>
                  <div className="text-xs text-slate-500">
                    {inv.jobCard.vehicle.make} {inv.jobCard.vehicle.model} ·{" "}
                    {inv.jobCard.vehicle.plateNumber}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {Number(inv.total).toFixed(2)}
                  </div>
                  {inv.issuedAt && (
                    <div className="text-xs text-slate-500">
                      {new Date(inv.issuedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
