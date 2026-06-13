/** Базовый URL приложения (локально / Vercel / custom domain) */
export function resolveSiteUrl(): string {
  const authUrl = process.env.AUTH_URL?.replace(/\/$/, "");
  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;

  if (vercelHost) {
    const vercelUrl = vercelHost.startsWith("http")
      ? vercelHost.replace(/\/$/, "")
      : `https://${vercelHost}`;

    // На Vercel игнорируем localhost из локального .env, попавший в деплой
    if (
      !authUrl ||
      authUrl.includes("localhost") ||
      authUrl.includes("127.0.0.1")
    ) {
      return vercelUrl;
    }
  }

  if (authUrl) return authUrl;
  return "http://localhost:3000";
}

/** @deprecated используйте resolveSiteUrl */
export function getSiteUrl(): string {
  return resolveSiteUrl();
}
