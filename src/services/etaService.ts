/** Typical job duration in minutes, keyed by category id (lowercase). */
const CATEGORY_DURATION_MINUTES: Record<string, number> = {
  plumbing: 60,
  electrical: 90,
  construction: 180,
  cleaning: 120,
  painting: 150,
  hvac: 90,
  landscaping: 120,
  carpentry: 90,
  roofing: 180,
  default: 60,
};

export function getCategoryDurationMinutes(categoryId: string): number {
  return CATEGORY_DURATION_MINUTES[categoryId.toLowerCase()] ?? CATEGORY_DURATION_MINUTES.default;
}

/**
 * Returns how many minutes remain in the job based on category average.
 * Once elapsed time exceeds the estimate, returns 0.
 */
export function getRemainingJobMinutes(categoryId: string, jobStartedAt: Date): number {
  const elapsedMin = Math.floor((Date.now() - jobStartedAt.getTime()) / 60_000);
  return Math.max(0, getCategoryDurationMinutes(categoryId) - elapsedMin);
}

/**
 * Calls the Google Maps Distance Matrix API to get driving ETA in minutes.
 * Returns null if the API key is missing, the request fails, or no route is found.
 */
export async function getArrivalEtaMinutes(
  driverLat: number,
  driverLng: number,
  destinationAddress: string
): Promise<number | null> {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API as string | undefined;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json` +
        `?origins=${driverLat},${driverLng}` +
        `&destinations=${encodeURIComponent(destinationAddress)}` +
        `&mode=driving` +
        `&key=${apiKey}`
    );
    const data = (await res.json()) as {
      rows?: Array<{
        elements?: Array<{ status: string; duration?: { value: number } }>;
      }>;
    };
    const element = data.rows?.[0]?.elements?.[0];
    if (element?.status === "OK" && element.duration) {
      return Math.ceil(element.duration.value / 60);
    }
  } catch {
    // network error or malformed response — caller falls back gracefully
  }
  return null;
}

/** Formats a minute count into a human-readable string like "5 min" or "1 hr 20 min". */
export function formatEtaMinutes(minutes: number): string {
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}
