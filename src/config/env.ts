import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || "5000",
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "default-secret-change-me",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587"),
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || "",
  FROM_EMAIL:
    process.env.FROM_EMAIL || "West Main Tire <noreply@westmaintire.com>",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
} as const;

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

if (env.JWT_SECRET === "default-secret-change-me") {
  console.warn(
    "⚠️  WARNING: Using default JWT_SECRET. Please set a strong secret in production.",
  );
}
