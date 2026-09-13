import { Hono } from "hono";
import { requireAuth, type AuthUser } from "../middleware/auth";
import { getPrisma } from "../lib/db";

type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  IMAGES_BUCKET: R2Bucket;
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 8 * 1024 * 1024; // 8 MB

export const jobCardImagesRoute = new Hono<{ Bindings: Bindings }>();

jobCardImagesRoute.use("*", requireAuth);

/**
 * POST /job-cards/:jobId/images
 * Multipart form: file, category (entry|exit), optional caption
 * Uploads to R2 and creates JobCardImage record
 */
jobCardImagesRoute.post("/:jobId/images", async (c) => {
  const jobId = c.req.param("jobId");
  const user = c.get("user") as AuthUser;
  const prisma = await getPrisma(c.env.DATABASE_URL || process.env.DATABASE_URL);

  const job = await prisma.jobCard.findFirst({
    where: { id: jobId, deletedAt: null },
  });
  if (!job) return c.json({ error: "Job card not found" }, 404);

  let formData: FormData;
  try {
    formData = await c.req.formData();
  } catch {
    return c.json({ error: "Invalid form data" }, 400);
  }

  const file = formData.get("file");
  const category = String(formData.get("category") || "").toLowerCase();
  const caption = formData.get("caption")
    ? String(formData.get("caption")).trim()
    : null;

  if (category !== "entry" && category !== "exit") {
    return c.json({ error: "category must be 'entry' or 'exit'" }, 400);
  }

  if (!file || !(file instanceof File)) {
    return c.json({ error: "file is required" }, 400);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return c.json(
      { error: "Only JPEG, PNG, and WebP images are allowed" },
      400
    );
  }

  if (file.size > MAX_SIZE) {
    return c.json({ error: "File too large (max 8 MB)" }, 400);
  }

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";
  const objectKey = `job-cards/${jobId}/${category}/${crypto.randomUUID()}.${ext}`;

  // Upload to R2 (or skip storage in local dev without binding)
  const bucket = c.env.IMAGES_BUCKET;
  if (bucket) {
    const arrayBuffer = await file.arrayBuffer();
    await bucket.put(objectKey, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
      customMetadata: {
        jobCardId: jobId,
        category,
        uploadedBy: user.id,
      },
    });
  } else {
    // Local dev without R2: still save DB record with path for testing UI
    console.warn("IMAGES_BUCKET not bound – saving metadata only");
  }

  const image = await prisma.jobCardImage.create({
    data: {
      jobCardId: jobId,
      category: category as "entry" | "exit",
      storagePath: objectKey,
      fileName: file.name || `photo.${ext}`,
      mimeType: file.type,
      sizeBytes: file.size,
      caption,
      uploadedBy: user.id,
      takenAt: new Date(),
    },
  });

  return c.json(image, 201);
});

/**
 * GET /job-cards/:jobId/images/:imageId/url
 * Returns a short-lived URL to view the image from R2
 */
jobCardImagesRoute.get("/:jobId/images/:imageId/url", async (c) => {
  const jobId = c.req.param("jobId");
  const imageId = c.req.param("imageId");
  const prisma = await getPrisma(c.env.DATABASE_URL || process.env.DATABASE_URL);

  const image = await prisma.jobCardImage.findFirst({
    where: { id: imageId, jobCardId: jobId, deletedAt: null },
  });
  if (!image) return c.json({ error: "Image not found" }, 404);

  const bucket = c.env.IMAGES_BUCKET;
  if (!bucket) {
    return c.json({
      url: null,
      message: "R2 not configured – image metadata only",
      storagePath: image.storagePath,
    });
  }

  const object = await bucket.get(image.storagePath);
  if (!object) {
    return c.json({ error: "File not found in storage" }, 404);
  }

  // Stream the image directly (simple approach for MVP)
  const headers = new Headers();
  headers.set("Content-Type", image.mimeType || "image/jpeg");
  headers.set("Cache-Control", "public, max-age=86400");
  if (object.httpEtag) headers.set("ETag", object.httpEtag);

  return new Response(object.body, { headers });
});

/**
 * DELETE /job-cards/:jobId/images/:imageId
 */
jobCardImagesRoute.delete("/:jobId/images/:imageId", async (c) => {
  const jobId = c.req.param("jobId");
  const imageId = c.req.param("imageId");
  const prisma = await getPrisma(c.env.DATABASE_URL || process.env.DATABASE_URL);

  const image = await prisma.jobCardImage.findFirst({
    where: { id: imageId, jobCardId: jobId, deletedAt: null },
  });
  if (!image) return c.json({ error: "Image not found" }, 404);

  // Soft-delete DB record
  await prisma.jobCardImage.update({
    where: { id: imageId },
    data: { deletedAt: new Date() },
  });

  // Optionally remove from R2
  const bucket = c.env.IMAGES_BUCKET;
  if (bucket) {
    try {
      await bucket.delete(image.storagePath);
    } catch (e) {
      console.warn("R2 delete failed", e);
    }
  }

  return c.json({ success: true });
});
