import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../services/firebase";
import type { ServiceRequest } from "../types";

export interface DriverLocation {
  lat: number;
  lng: number;
  updatedAt: Date;
}

function parseRequestDoc(id: string, data: Record<string, unknown>): ServiceRequest {
  const d = data as Record<string, { toDate?: () => Date } & unknown>;
  return {
    ...(data as Omit<ServiceRequest, "id">),
    id,
    createdAt: d.createdAt?.toDate?.() ?? new Date(),
    updatedAt: d.updatedAt?.toDate?.() ?? new Date(),
    scheduledAt: d.scheduledAt?.toDate?.(),
    estimatedArrivalTime: d.estimatedArrivalTime?.toDate?.(),
    estimatedCompletionTime: d.estimatedCompletionTime?.toDate?.(),
    jobStartedAt: d.jobStartedAt?.toDate?.(),
  };
}

/**
 * Subscribes to a single serviceRequests document via Firestore onSnapshot.
 * Returns null while loading or when the document doesn't exist.
 */
export function useJobListener(requestId: string | null) {
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!requestId || !isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(
      doc(db, "serviceRequests", requestId),
      (snap) => {
        setRequest(snap.exists() ? parseRequestDoc(snap.id, snap.data()) : null);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsub;
  }, [requestId]);

  return { request, loading };
}

/**
 * Subscribes to a driverLocations document for a given request.
 * Updated by the driver every ~10 seconds while en_route.
 */
export function useDriverLocation(requestId: string | null) {
  const [location, setLocation] = useState<DriverLocation | null>(null);

  useEffect(() => {
    if (!requestId || !isFirebaseConfigured) return;

    const unsub = onSnapshot(
      doc(db, "driverLocations", requestId),
      (snap) => {
        if (!snap.exists()) {
          setLocation(null);
          return;
        }
        const data = snap.data() as { lat: number; lng: number; updatedAt?: { toDate?: () => Date } };
        setLocation({
          lat: data.lat,
          lng: data.lng,
          updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
        });
      }
    );

    return unsub;
  }, [requestId]);

  return location;
}
