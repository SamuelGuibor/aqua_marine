// Na v11 o withSentryConfig fica em "@sentry/nextjs/config" (CommonJS: importação padrão).
import sentryConfig from "@sentry/nextjs/config";

const { withSentryConfig } = sentryConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
};

// Source maps vão para o Sentry no build só com SENTRY_AUTH_TOKEN, SENTRY_ORG e SENTRY_PROJECT
// todos preenchidos; faltando um, nada é enviado (sem tentativa que falhe em silêncio).
const enviarSourceMaps = Boolean(
  process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT,
);

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  telemetry: false,
  sourcemaps: { disable: !enviarSourceMaps },
  release: { create: enviarSourceMaps },
});
