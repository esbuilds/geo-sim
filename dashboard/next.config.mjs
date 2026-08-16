/** @type {import('next').NextConfig} */
export default {
  // better-sqlite3 is a native module; keep it out of the bundle.
  serverExternalPackages: ['better-sqlite3'],
};
