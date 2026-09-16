import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { healthRoute } from "./routes/health";
import { authRoute } from "./routes/auth";
import { customersRoute } from "./routes/customers";
import { vehiclesRoute } from "./routes/vehicles";
import { jobCardsRoute } from "./routes/job-cards";
import { jobCardImagesRoute } from "./routes/job-card-images";
import { invoicesRoute } from "./routes/invoices";
import { dashboardRoute } from "./routes/dashboard";

type Bindings = {
  IMAGES_BUCKET: R2Bucket;
  DATABASE_URL: string;
  JWT_SECRET: string;
  ENVIRONMENT: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "https://garage-api.altabadulauto.workers.dev"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.route("/health", healthRoute);
app.route("/auth", authRoute);
app.route("/customers", customersRoute);
app.route("/vehicles", vehiclesRoute);
app.route("/job-cards", jobCardsRoute);
app.route("/job-cards", jobCardImagesRoute);
app.route("/invoices", invoicesRoute);
app.route("/dashboard", dashboardRoute);

app.get("/", (c) =>
  c.json({ name: "Garage Manager API", version: "0.1.0", status: "ok" })
);

app.notFound((c) => c.json({ error: "Not Found" }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json(
    {
      error: "Internal Server Error",
      message: err instanceof Error ? err.message : "Unknown error",
    },
    500
  );
});

export default app;
