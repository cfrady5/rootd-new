// Small runtime config for feature flags and constants
export const BASELINE = (import.meta.env.VITE_BASELINE === "1" || import.meta.env.VITE_BASELINE === "true") || false;
