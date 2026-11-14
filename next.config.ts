import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    const backendBaseUrl = (
      process.env.BASE_URL || "http://localhost:9503"
    ).replace(/\/+$/, "");

    return [
      {
        source: "/autodiscover",
        destination: `${backendBaseUrl}/autodiscover`,
      },
      {
        source: "/Autodiscover",
        destination: `${backendBaseUrl}/Autodiscover`,
      },
      {
        source: "/autodiscover.json",
        destination: `${backendBaseUrl}/autodiscover.json`,
      },
      {
        source: "/autodiscover.xml",
        destination: `${backendBaseUrl}/autodiscover.xml`,
      },
      {
        source: "/autodiscover/autodiscover.xml",
        destination: `${backendBaseUrl}/autodiscover/autodiscover.xml`,
      },
      {
        source: "/Autodiscover/Autodiscover.xml",
        destination: `${backendBaseUrl}/Autodiscover/Autodiscover.xml`,
      },
      {
        source: "/mail/config-v1.1.xml",
        destination: `${backendBaseUrl}/mail/config-v1.1.xml`,
      },
      {
        source: "/.well-known/autoconfig/mail/config-v1.1.xml",
        destination: `${backendBaseUrl}/.well-known/autoconfig/mail/config-v1.1.xml`,
      },
    ];
  },
};

export default nextConfig;
