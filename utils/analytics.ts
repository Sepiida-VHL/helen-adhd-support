// Lightweight Plausible helper. Safe to import in client components only.
// Usage: track('Event Name', { prop: 'value' })
export type PlausibleProps = Record<string, string | number | boolean | undefined>;

export function track(event: string, props?: PlausibleProps) {
  if (typeof window === 'undefined') return; // no-op on server
  const anyWindow = window as unknown as { plausible?: (event: string, options?: { props?: PlausibleProps }) => void };
  if (typeof anyWindow.plausible === 'function') {
    try {
      anyWindow.plausible(event, props ? { props } : undefined);
    } catch (e) {
      // swallow errors to avoid breaking UX flows
    }
  }
}

