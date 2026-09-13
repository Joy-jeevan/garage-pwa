import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { JobCardDetail, JobStatus } from "../types/job-card";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  ALL_STATUSES,
} from "../types/job-card";
import AddItemForm from "../components/job-cards/AddItemForm";
import PhotoSection from "../components/job-cards/PhotoSection";

export default function JobCardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddItem, setShowAddItem] = useState(false);

  const { data: job, isLoading, error } = useQuery({
    queryKey: ["job-card", id],
    queryFn: () => api<JobCardDetail>(`/job-cards/${id}`),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: (status: JobStatus) =>
      api(`/job-cards/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-card", id] });
      queryClient.invalidateQueries({ queryKey: ["job-cards"] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) =>
      api(`/job-cards/${id}/items/${itemId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-card", id] });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: () => api(`/job-cards/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-cards"] });
      navigate("/job-cards");
    },
  });

  const invoiceMutation = useMutation({
    mutationFn: () =>
      api<{ id: string }>("/invoices", {
        method: "POST",
        body: JSON.stringify({ jobCardId: id, taxAmount: 0 }),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["job-card", id] });
      queryClient.invalidateQueries({ queryKey: ["job-cards"] });
      navigate(`/invoices/${data.id}`);
    },
  });

  if (isLoading) {
    return <div className="text-slate-400 text-sm">Loading...</div>;
  }

  if (error || !job) {
    return (
      <div className="text-red-400 text-sm">
        Job card not found.{" "}
        <Link to="/job-cards" className="underline">
          Back to list
        </Link>
      </div>
    );
  }

  const total = job.items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link to="/job-cards" className="hover:text-slate-200">
          Job Cards
        </Link>
        <span>/</span>
        <span className="text-slate-200 font-mono">{job.jobNumber}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight font-mono">
              {job.jobNumber}
            </h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[job.status]}`}
            >
              {STATUS_LABELS[job.status]}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            {new Date(job.dateIn).toLocaleString()}
            {job.priority !== "normal" && (
              <span className="ml-2 capitalize">· {job.priority} priority</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={job.status}
            onChange={(e) =>
              statusMutation.mutate(e.target.value as JobStatus)
            }
            disabled={statusMutation.isPending}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm outline-none focus:border-sky-500"
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          {(job.status === "completed" || job.status === "invoiced") && (
            <button
              onClick={() => {
                if (confirm("Generate invoice from this job?")) {
                  invoiceMutation.mutate();
                }
              }}
              disabled={invoiceMutation.isPending}
              className="rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium hover:bg-violet-500 disabled:opacity-50 transition"
            >
              {invoiceMutation.isPending ? "Creating..." : "Generate invoice"}
            </button>
          )}
          <button
            onClick={() => {
              if (confirm("Soft-delete this job card?")) {
                deleteJobMutation.mutate();
              }
            }}
            className="rounded-md border border-red-900/50 text-red-400 px-3 py-1.5 text-sm hover:bg-red-950/50 transition"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Customer & Vehicle */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-xs text-slate-500 mb-1">Customer</div>
          <Link
            to={`/customers/${job.customer.id}`}
            className="font-medium text-sky-400 hover:underline"
          >
            {job.customer.fullName}
          </Link>
          <div className="text-sm font-mono text-slate-400">
            {job.customer.mobile}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-xs text-slate-500 mb-1">Vehicle</div>
          <Link
            to={`/vehicles/${job.vehicle.id}`}
            className="font-medium text-sky-400 hover:underline"
          >
            {job.vehicle.make} {job.vehicle.model}
            {job.vehicle.year ? ` (${job.vehicle.year})` : ""}
          </Link>
          <div className="text-sm font-mono text-slate-400">
            {job.vehicle.plateNumber}
          </div>
          {job.mileageIn != null && (
            <div className="text-xs text-slate-500 mt-1">
              Mileage in: {job.mileageIn.toLocaleString()} km
              {job.mileageOut != null &&
                ` · out: ${job.mileageOut.toLocaleString()} km`}
            </div>
          )}
        </div>
      </div>

      {job.description && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-300">
          <div className="text-xs text-slate-500 mb-1">Work requested</div>
          {job.description}
        </div>
      )}

      {job.notes && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-300">
          <div className="text-xs text-slate-500 mb-1">Internal notes</div>
          {job.notes}
        </div>
      )}

      {/* Line items */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Labor & Parts</h2>
          <button
            onClick={() => setShowAddItem(true)}
            className="text-sm text-sky-400 hover:underline"
          >
            + Add item
          </button>
        </div>

        {job.items.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-500">
            No labor or parts added yet.
          </div>
        ) : (
          <div className="rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/80 text-slate-400 text-xs">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Type</th>
                  <th className="text-left px-4 py-2 font-medium">Description</th>
                  <th className="text-right px-4 py-2 font-medium">Qty</th>
                  <th className="text-right px-4 py-2 font-medium">Price</th>
                  <th className="text-right px-4 py-2 font-medium">Total</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {job.items.map((item) => {
                  const qty = Number(item.quantity) || 0;
                  const price = Number(item.unitPrice) || 0;
                  return (
                    <tr
                      key={item.id}
                      className="border-t border-slate-800 hover:bg-slate-900/40"
                    >
                      <td className="px-4 py-2 capitalize text-slate-400">
                        {item.type}
                      </td>
                      <td className="px-4 py-2">
                        {item.description}
                        {item.hours != null && (
                          <span className="text-xs text-slate-500 ml-1">
                            ({Number(item.hours)}h)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">{qty}</td>
                      <td className="px-4 py-2 text-right">
                        {price.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-right font-medium">
                        {(qty * price).toFixed(2)}
                      </td>
                      <td className="px-2 py-2 text-right">
                        <button
                          onClick={() => {
                            if (confirm("Remove this item?")) {
                              deleteItemMutation.mutate(item.id);
                            }
                          }}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-700 bg-slate-900/60">
                  <td
                    colSpan={4}
                    className="px-4 py-2 text-right text-slate-400"
                  >
                    Subtotal
                  </td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {total.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      <PhotoSection jobId={job.id} images={job.images} />

      {showAddItem && (
        <AddItemForm
          jobCardId={job.id}
          onClose={() => setShowAddItem(false)}
          onSuccess={() => {
            setShowAddItem(false);
            queryClient.invalidateQueries({ queryKey: ["job-card", id] });
          }}
        />
      )}
    </div>
  );
}
