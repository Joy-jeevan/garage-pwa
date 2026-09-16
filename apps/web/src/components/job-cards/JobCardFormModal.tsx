import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { Customer } from "../../types/customer";
import type { Vehicle } from "../../types/vehicle";

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function JobCardFormModal({ onClose, onSuccess }: Props) {
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normal");
  const [mileageIn, setMileageIn] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: customers = [] } = useQuery({
    queryKey: ["customers-picker", customerSearch],
    queryFn: () => {
      const params = new URLSearchParams();
      if (customerSearch) {
        if (/^[0-9+\-\s()]+$/.test(customerSearch)) {
          params.set("mobile", customerSearch);
        } else {
          params.set("q", customerSearch);
        }
      }
      const qs = params.toString();
      return api<Customer[]>(`/customers${qs ? `?${qs}` : ""}`);
    },
    enabled: !customerId,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles-for-customer", customerId],
    queryFn: () =>
      api<Vehicle[]>(`/vehicles?customerId=${customerId}`),
    enabled: !!customerId,
  });

  useEffect(() => {
    setVehicleId("");
    setMileageIn("");
  }, [customerId]);

  useEffect(() => {
    const v = vehicles.find((x) => x.id === vehicleId);
    if (v?.currentMileage != null) {
      setMileageIn(String(v.currentMileage));
    }
  }, [vehicleId, vehicles]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!customerId || !vehicleId) {
      setError("Please select customer and vehicle");
      return;
    }
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        customerId,
        vehicleId,
        description: description.trim() || undefined,
        priority,
        notes: notes.trim() || undefined,
      };
      if (mileageIn) payload.mileageIn = parseInt(mileageIn, 10);

      await api("/job-cards", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create job card");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <h2 className="font-semibold">New Job Card</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-lg leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="rounded-md bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Customer */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Customer * (search mobile or name)
            </label>
            <input
              type="search"
              value={customerSearch}
              onChange={(e) => {
                setCustomerSearch(e.target.value);
                setCustomerId("");
              }}
              placeholder="Type mobile or name..."
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            {!customerId && customerSearch && customers.length > 0 && (
              <div className="mt-1 max-h-36 overflow-y-auto rounded-md border border-slate-700 bg-slate-950">
                {customers.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCustomerId(c.id);
                      setCustomerSearch(`${c.fullName} (${c.mobile})`);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-800 border-b border-slate-800 last:border-0"
                  >
                    <span className="font-medium">{c.fullName}</span>
                    <span className="text-brand-400 font-mono ml-2 text-xs">
                      {c.mobile}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {customerId && (
              <p className="mt-1 text-xs text-emerald-400">Customer selected</p>
            )}
          </div>

          {/* Vehicle */}
          {customerId && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Vehicle *
              </label>
              {vehicles.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No vehicles for this customer. Add a vehicle first.
                </p>
              ) : (
                <select
                  required
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-brand-500"
                >
                  <option value="">Select vehicle...</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.make} {v.model} · {v.plateNumber}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Work requested
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Customer complaint / requested work..."
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-brand-500"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Mileage in
              </label>
              <input
                type="number"
                min={0}
                value={mileageIn}
                onChange={(e) => setMileageIn(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Internal notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-slate-700 py-2 text-sm hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-md bg-brand-600 py-2 text-sm font-medium hover:bg-brand-500 disabled:opacity-50 transition"
            >
              {loading ? "Creating..." : "Create Job Card"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
