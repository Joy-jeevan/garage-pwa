import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

type InvoiceDetail = {
  id: string;
  invoiceNumber: string;
  status: string;
  subtotal: number | string;
  taxAmount: number | string;
  total: number | string;
  notes: string | null;
  issuedAt: string | null;
  customer: {
    id: string;
    fullName: string;
    mobile: string;
    email: string | null;
    address: string | null;
  };
  jobCard: {
    id: string;
    jobNumber: string;
    vehicle: {
      make: string;
      model: string;
      plateNumber: string;
    };
    items: Array<{
      id: string;
      type: string;
      description: string;
      quantity: number | string;
      unitPrice: number | string;
    }>;
  };
  payments: Array<{
    id: string;
    amount: number | string;
    method: string;
    paidAt: string;
    reference: string | null;
  }>;
};

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [showPay, setShowPay] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");

  const { data: inv, isLoading, error: loadError } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => api<InvoiceDetail>(`/invoices/${id}`),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) =>
      api(`/invoices/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice", id] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const payMutation = useMutation({
    mutationFn: () =>
      api(`/invoices/${id}/payments`, {
        method: "POST",
        body: JSON.stringify({
          amount: parseFloat(amount),
          method,
          reference: reference || undefined,
        }),
      }),
    onSuccess: () => {
      setShowPay(false);
      setAmount("");
      setReference("");
      queryClient.invalidateQueries({ queryKey: ["invoice", id] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: Error) => setError(err.message),
  });

  if (isLoading) return <div className="text-slate-400 text-sm">Loading...</div>;
  if (loadError || !inv) {
    return (
      <div className="text-red-400 text-sm">
        Invoice not found.{" "}
        <Link to="/invoices" className="underline">
          Back
        </Link>
      </div>
    );
  }

  const paidSum = inv.payments.reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link to="/invoices" className="hover:text-slate-200">
          Invoices
        </Link>
        <span>/</span>
        <span className="font-mono text-slate-200">{inv.invoiceNumber}</span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono">{inv.invoiceNumber}</h1>
          <p className="text-sm text-slate-400 capitalize mt-1">
            Status: {inv.status}
            {inv.issuedAt &&
              ` · ${new Date(inv.issuedAt).toLocaleDateString()}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {inv.status !== "paid" && inv.status !== "cancelled" && (
            <>
              <button
                onClick={() => statusMutation.mutate("sent")}
                className="rounded-md border border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-800"
              >
                Mark sent
              </button>
              <button
                onClick={() => setShowPay(true)}
                className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium hover:bg-brand-500"
              >
                Record payment
              </button>
            </>
          )}
          <button
            onClick={() => window.print()}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-800"
          >
            Print
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-xs text-slate-500 mb-1">Bill to</div>
          <Link
            to={`/customers/${inv.customer.id}`}
            className="font-medium text-brand-400 hover:underline"
          >
            {inv.customer.fullName}
          </Link>
          <div className="text-sm font-mono text-slate-400">
            {inv.customer.mobile}
          </div>
          {inv.customer.address && (
            <div className="text-xs text-slate-500 mt-1">
              {inv.customer.address}
            </div>
          )}
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-xs text-slate-500 mb-1">Job / Vehicle</div>
          <Link
            to={`/job-cards/${inv.jobCard.id}`}
            className="font-mono text-brand-400 hover:underline text-sm"
          >
            {inv.jobCard.jobNumber}
          </Link>
          <div className="text-sm text-slate-300 mt-0.5">
            {inv.jobCard.vehicle.make} {inv.jobCard.vehicle.model} ·{" "}
            {inv.jobCard.vehicle.plateNumber}
          </div>
        </div>
      </div>

      {/* Line items from job */}
      <div className="rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/80 text-slate-400 text-xs">
            <tr>
              <th className="text-left px-4 py-2">Description</th>
              <th className="text-right px-4 py-2">Qty</th>
              <th className="text-right px-4 py-2">Price</th>
              <th className="text-right px-4 py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {inv.jobCard.items.map((item) => {
              const qty = Number(item.quantity);
              const price = Number(item.unitPrice);
              return (
                <tr key={item.id} className="border-t border-slate-800">
                  <td className="px-4 py-2">
                    <span className="text-slate-500 capitalize text-xs mr-1">
                      {item.type}
                    </span>
                    {item.description}
                  </td>
                  <td className="px-4 py-2 text-right">{qty}</td>
                  <td className="px-4 py-2 text-right">{price.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">
                    {(qty * price).toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t border-slate-700 bg-slate-900/60">
            <tr>
              <td colSpan={3} className="px-4 py-2 text-right text-slate-400">
                Subtotal
              </td>
              <td className="px-4 py-2 text-right">
                {Number(inv.subtotal).toFixed(2)}
              </td>
            </tr>
            <tr>
              <td colSpan={3} className="px-4 py-2 text-right text-slate-400">
                Tax
              </td>
              <td className="px-4 py-2 text-right">
                {Number(inv.taxAmount).toFixed(2)}
              </td>
            </tr>
            <tr>
              <td
                colSpan={3}
                className="px-4 py-2 text-right font-medium"
              >
                Total
              </td>
              <td className="px-4 py-2 text-right font-bold">
                {Number(inv.total).toFixed(2)}
              </td>
            </tr>
            <tr>
              <td colSpan={3} className="px-4 py-2 text-right text-slate-400">
                Paid
              </td>
              <td className="px-4 py-2 text-right text-emerald-400">
                {paidSum.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {inv.payments.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-2">Payments</h2>
          <div className="space-y-1">
            {inv.payments.map((p) => (
              <div
                key={p.id}
                className="text-sm text-slate-400 flex justify-between rounded-lg border border-slate-800 px-3 py-2"
              >
                <span>
                  {new Date(p.paidAt).toLocaleString()} · {p.method}
                  {p.reference && ` · ${p.reference}`}
                </span>
                <span className="text-slate-200">
                  {Number(p.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {showPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <h2 className="font-semibold">Record payment</h2>
            {error && (
              <div className="text-sm text-red-400">{error}</div>
            )}
            <div>
              <label className="text-sm text-slate-300">Amount</label>
              <input
                type="number"
                step="0.01"
                min={0.01}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={String(
                  Math.max(0, Number(inv.total) - paidSum).toFixed(2)
                )}
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300">Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank transfer</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-300">Reference</label>
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPay(false)}
                className="flex-1 rounded-md border border-slate-700 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => payMutation.mutate()}
                disabled={payMutation.isPending || !amount}
                className="flex-1 rounded-md bg-brand-600 py-2 text-sm font-medium disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
