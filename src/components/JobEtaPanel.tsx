import { useState, useEffect } from "react";
import { useDriverLocation } from "../hooks/useJobListener";
import { getArrivalEtaMinutes, getRemainingJobMinutes, formatEtaMinutes } from "../services/etaService";
import type { ServiceRequest } from "../types";

interface Props {
  request: ServiceRequest;
}

function timeSince(date: Date): string {
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 60) return "just now";
  return `${Math.floor(sec / 60)} min ago`;
}

export function JobEtaPanel({ request }: Props) {
  const isEnRoute = request.status === "en_route";
  const isInProgress = request.status === "in_progress";

  const driverLocation = useDriverLocation(isEnRoute ? request.id : null);
  const [arrivalEta, setArrivalEta] = useState<number | null>(null);
  const [remainingMin, setRemainingMin] = useState<number | null>(null);

  // Recalculate arrival ETA whenever the driver's position updates
  useEffect(() => {
    if (!isEnRoute || !driverLocation) return;
    let cancelled = false;
    void getArrivalEtaMinutes(driverLocation.lat, driverLocation.lng, request.address).then(
      (eta) => { if (!cancelled) setArrivalEta(eta); }
    );
    return () => { cancelled = true; };
  }, [driverLocation, isEnRoute, request.address]);

  // Tick remaining job time down every minute
  useEffect(() => {
    if (!isInProgress || !request.jobStartedAt) {
      setRemainingMin(null);
      return;
    }
    const tick = () => setRemainingMin(getRemainingJobMinutes(request.categoryId, request.jobStartedAt!));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [isInProgress, request.categoryId, request.jobStartedAt]);

  if (isEnRoute) {
    return (
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 mb-3">
        <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wide mb-0.5">
          Helper ETA
        </p>
        <p className="text-sm font-black text-blue-900">
          {arrivalEta !== null ? `${formatEtaMinutes(arrivalEta)} away` : "Calculating…"}
        </p>
        {driverLocation && (
          <p className="text-[10px] text-blue-500 mt-0.5">
            Updated {timeSince(driverLocation.updatedAt)}
          </p>
        )}
      </div>
    );
  }

  if (isInProgress && remainingMin !== null) {
    return (
      <div className="bg-violet-50 border border-violet-100 rounded-xl px-3 py-2.5 mb-3">
        <p className="text-[10px] font-bold text-violet-700 uppercase tracking-wide mb-0.5">
          Est. Completion
        </p>
        <p className="text-sm font-black text-violet-900">
          {remainingMin > 0 ? `${formatEtaMinutes(remainingMin)} remaining` : "Wrapping up soon"}
        </p>
        <p className="text-[10px] text-violet-500 mt-0.5">
          Based on typical {request.categoryId} jobs
        </p>
      </div>
    );
  }

  return null;
}
