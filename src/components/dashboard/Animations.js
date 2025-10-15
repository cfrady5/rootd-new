// Legacy file left in place to avoid import errors during incremental edits.
// The real JSX component lives in Animations.jsx. Export a no-op fallback here.
export function FadeUp({ children }) {
  return children || null;
}

export default FadeUp;
