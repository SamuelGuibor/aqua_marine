import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
};

// Source maps vão para o Sentry no build só com SENTRY_AUTH_TOKEN (Vercel);
// sem ele, nada é enviado e o build segue em silêncio.
const enviarSourceMaps = Boolean(process.env.SENTRY_AUTH_TOKEN);

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  telemetry: false,
  sourcemaps: { disable: !enviarSourceMaps },
  release: { create: enviarSourceMaps },
});
