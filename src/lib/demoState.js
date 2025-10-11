const KEY = "rootd_demo_profile_v1";

export function loadDemoProfile() {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}
export function saveDemoProfile(profile, socials) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ profile, socials }));
  } catch (err) {
    console.warn("[demoState] failed to save", err);
  }
}
