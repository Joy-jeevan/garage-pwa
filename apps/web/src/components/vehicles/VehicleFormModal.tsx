import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { Vehicle } from "../../types/vehicle";
import type { Customer } from "../../types/customer";

type Props = {
  vehicle?: Vehicle;
  defaultCustomerId?: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function VehicleFormModal({
  vehicle,
  defaultCustomerId,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = !!vehicle;

  const [customerId, setCustomerId] = useState(
    vehicle?.customerId || defaultCustomerId || ""
  );
  const [customerSearch, setCustomerSearch] = useState("");
  const [make, setMake] = useState(vehicle?.make || "");
  const [model, setModel] = useState(vehicle?.model || "");
  const [year, setYear] = useState(vehicle?.year?.toString() || "");
  const [plateNumber, setPlateNumber] = useState(vehicle?.plateNumber || "");
  const [vin, setVin] = useState(vehicle?.vin || "");
  const [color, setColor] = useState(vehicle?.color || "");
  const [currentMileage, setCurrentMileage] = useState(
    vehicle?.currentMileage?.toString() || ""
  );
  const [notes, setNotes] = useState(vehicle?.notes || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Search customers for the picker (only when creating)
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
    enabled: !isEdit && !defaultCustomerId,
  });

  // Load default customer if provided
  const { data: defaultCustomer } = useQuery({
    queryKey: ["customer", defaultCustomerId],
    queryFn: () => api<Customer>(`/customers/${defaultCustomerId}`),
    enabled: !isEdit && !!defaultCustomerId,
  });

  useEffect(() => {
    if (vehicle?.customer) {
      setCustomerSearch(
        `${vehicle.customer.fullName} (${vehicle.customer.mobile})`
      );
    } else if (defaultCustomer) {
      setCustomerId(defaultCustomer.id);
      setCustomerSearch(
        `${defaultCustomer.fullName} (${defaultCustomer.mobile})`
      );
    }
  }, [vehicle, defaultCustomer]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!isEdit && !customerId) {
        setError("Please select a customer");
        setLoading(false);
        return;
      }

      const payload: Record<string, unknown> = {
        make: make.trim(),
        model: model.trim(),
        plateNumber: plateNumber.trim(),
        vin: vin.trim() || undefined,
        color: color.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      if (year) payload.year = parseInt(year, 10);
      if (currentMileage)
        payload.currentMileage = parseInt(currentMileage, 10);

      if (isEdit) {
        await api(`/vehicles/${vehicle.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        payload.customerId = customerId;
        await api("/vehicles", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <h2 className="font-semibold">
            {isEdit ? "Edit Vehicle" : "New Vehicle"}
          </h2>
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

          {/* Customer picker (create only) */}
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Customer * (search by mobile or name)
              </label>
              <input
                type="search"
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setCustomerId("");
                }}
                placeholder="Type mobile or name..."
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
              {customerSearch && !customerId && customers.length > 0 && (
                <div className="mt-1 max-h-40 overflow-y-auto rounded-md border border-slate-700 bg-slate-950">
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
                      <span className="text-sky-400 font-mono ml-2 text-xs">
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
          )}

          {isEdit && vehicle?.customer && (
            <div className="text-sm text-slate-400">
              Owner:{" "}
              <span className="text-slate-200">
                {vehicle.customer.fullName} ({vehicle.customer.mobile})
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Make *
              </label>
              <input
                required
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="Toyota"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Model *
              </label>
              <input
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Corolla"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Plate number *
              </label>
              <input
                required
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                placeholder="ABC-1234"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Year
              </label>
              <input
                type="number"
                min={1900}
                max={2100}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2020"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Color
              </label>
              <input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Mileage (km)
              </label>
              <input
                type="number"
                min={0}
                value={currentMileage}
                onChange={(e) => setCurrentMileage(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              VIN
            </label>
            <input
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
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
              className="flex-1 rounded-md bg-sky-600 py-2 text-sm font-medium hover:bg-sky-500 disabled:opacity-50 transition"
            >
              {loading ? "Saving..." : isEdit ? "Save changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
