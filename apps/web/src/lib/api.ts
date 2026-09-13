const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  // Don't set Content-Type for FormData – browser sets multipart boundary
  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  // Binary response (image stream)
  const contentType = res.headers.get("Content-Type") || "";
  if (contentType.startsWith("image/")) {
    if (!res.ok) throw new Error("Failed to load image");
    return res as unknown as T;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error || "Request failed"
    );
  }

  return data as T;
}

/** Upload image to job card (multipart) */
export async function uploadJobImage(
  jobId: string,
  file: File,
  category: "entry" | "exit",
  caption?: string
) {
  const form = new FormData();
  form.append("file", file);
  form.append("category", category);
  if (caption) form.append("caption", caption);

  return api(`/job-cards/${jobId}/images`, {
    method: "POST",
    body: form,
  });
}

/** Image display URL (authenticated fetch preferred; this is the API path) */
export function jobImageUrl(jobId: string, imageId: string) {
  return `${API_URL}/job-cards/${jobId}/images/${imageId}/url`;
}
