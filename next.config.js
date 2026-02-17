const withNextIntl = require('next-intl/plugin')(
  // Specify the path to our i18n config file
  './i18n.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['plotly.js'],
};

module.exports = withNextIntl(nextConfig);
