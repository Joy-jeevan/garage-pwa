import { useState } from "react";
import { api } from "../../lib/api";

type Props = {
  jobCardId: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AddItemForm({ jobCardId, onClose, onSuccess }: Props) {
  const [type, setType] = useState<"labor" | "part" | "other">("labor");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [hours, setHours] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        type,
        description: description.trim(),
        quantity: parseFloat(quantity) || 1,
        unitPrice: parseFloat(unitPrice) || 0,
      };
      if (type === "labor" && hours) {
        payload.hours = parseFloat(hours);
      }
      await api(`/job-cards/${jobCardId}/items`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <h2 className="font-semibold">Add Labor / Part</h2>
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

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Type
            </label>
            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value as "labor" | "part" | "other")
              }
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-brand-500"
            >
              <option value="labor">Labor</option>
              <option value="part">Part</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Description *
            </label>
            <input
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                type === "labor"
                  ? "e.g. Oil change labor"
                  : type === "part"
                    ? "e.g. Oil filter"
                    : "Description"
              }
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min={0.01}
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Unit price
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                required
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {type === "labor" && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Hours (optional)
              </label>
              <input
                type="number"
                min={0}
                step="0.25"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          )}

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
              {loading ? "Adding..." : "Add item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
