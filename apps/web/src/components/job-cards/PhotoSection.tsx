import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, uploadJobImage, jobImageUrl } from "../../lib/api";

type JobImage = {
  id: string;
  category: "entry" | "exit";
  storagePath: string;
  fileName: string;
  caption?: string | null;
};

type Props = {
  jobId: string;
  images: JobImage[];
};

function AuthImage({
  jobId,
  imageId,
  alt,
}: {
  jobId: string;
  imageId: string;
  alt: string;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    const token = localStorage.getItem("token");
    fetch(jobImageUrl(jobId, imageId), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("fail");
        const blob = await res.blob();
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [jobId, imageId]);

  if (failed) {
    return (
      <div className="aspect-square rounded-lg bg-slate-800 flex items-center justify-center text-xs text-slate-500">
        Unavailable
      </div>
    );
  }

  if (!src) {
    return (
      <div className="aspect-square rounded-lg bg-slate-800 animate-pulse" />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="aspect-square w-full object-cover rounded-lg"
    />
  );
}

export default function PhotoSection({ jobId, images }: Props) {
  const queryClient = useQueryClient();
  const entryInputRef = useRef<HTMLInputElement>(null);
  const exitInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<"entry" | "exit" | null>(null);
  const [error, setError] = useState("");

  const entryImages = images.filter((i) => i.category === "entry");
  const exitImages = images.filter((i) => i.category === "exit");

  const deleteMutation = useMutation({
    mutationFn: (imageId: string) =>
      api(`/job-cards/${jobId}/images/${imageId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-card", jobId] });
    },
  });

  async function handleFiles(
    files: FileList | null,
    category: "entry" | "exit"
  ) {
    if (!files || files.length === 0) return;
    setError("");
    setUploading(category);

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          setError("Only image files are allowed");
          continue;
        }
        await uploadJobImage(jobId, file, category);
      }
      queryClient.invalidateQueries({ queryKey: ["job-card", jobId] });
      queryClient.invalidateQueries({ queryKey: ["job-cards"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
      if (entryInputRef.current) entryInputRef.current.value = "";
      if (exitInputRef.current) exitInputRef.current.value = "";
    }
  }

  function Gallery({
    title,
    category,
    items,
    inputRef,
  }: {
    title: string;
    category: "entry" | "exit";
    items: JobImage[];
    inputRef: React.RefObject<HTMLInputElement | null>;
  }) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">{title}</h3>
          <div>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files, category)}
            />
            <button
              type="button"
              disabled={uploading === category}
              onClick={() => inputRef.current?.click()}
              className="text-sm text-brand-400 hover:underline disabled:opacity-50"
            >
              {uploading === category ? "Uploading..." : "+ Add photos"}
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            No {category} photos yet. Use camera or gallery.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {items.map((img) => (
              <div key={img.id} className="relative group">
                <AuthImage jobId={jobId} imageId={img.id} alt={img.fileName} />
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Delete this photo?")) {
                      deleteMutation.mutate(img.id);
                    }
                  }}
                  className="absolute top-1 right-1 rounded bg-black/70 text-red-400 text-xs px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Photos</h2>
      {error && (
        <div className="rounded-md bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <Gallery
          title="Entry / Pre-service (damage & condition)"
          category="entry"
          items={entryImages}
          inputRef={entryInputRef}
        />
        <Gallery
          title="Exit / Post-service (completed work)"
          category="exit"
          items={exitImages}
          inputRef={exitInputRef}
        />
      </div>
      <p className="text-xs text-slate-500">
        JPEG, PNG or WebP · max 8 MB each · multiple photos supported
      </p>
    </section>
  );
}
