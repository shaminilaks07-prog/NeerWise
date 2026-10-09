/**
 * Single place to change the product name until the team picks a final brand.
 * Optionally override with VITE_APP_NAME in a local .env file.
 */
const envName = import.meta.env.VITE_APP_NAME as string | undefined;

export const BRAND = {
  name: envName && envName.trim() ? envName.trim() : 'NeerWise',
  tagline: 'Plan household water use, spot unusual days, and cut waste.',
} as const;
