import type { ServiceRequest, ServiceRequestStatus } from "../types";

/** Five-step pipeline shown to customers (delivery-style clarity). */
export const CUSTOMER_PIPELINE_STEPS = [
  { id: "posted", title: "Posted", subtitle: "Your request is visible nearby" },
  { id: "matched", title: "Helper matched", subtitle: "Someone accepted your job" },
  { id: "en_route", title: "On the way", subtitle: "They are heading to you" },
  { id: "working", title: "Working", subtitle: "Help is in progress" },
  { id: "done", title: "Done", subtitle: "Job closed" },
] as const;

/**
 * Current highlight index 0–4 for the pipeline UI.
 * `awaiting_customer` sits on the last step (helper finished; you confirm).
 */
export function getPipelineStepIndex(status: ServiceRequestStatus): number {
  switch (status) {
    case "pending":
      return 0;
    case "accepted":
    case "inspection":
    case "quote_provided":
      return 1;
    case "en_route":
      return 2;
    case "in_progress":
      return 3;
    case "awaiting_customer":
      return 4;
    case "completed":
      return 4;
    default:
      return 0;
  }
}

export function isPipelineComplete(status: ServiceRequestStatus): boolean {
  return status === "completed";
}

export function isCancelled(status: ServiceRequestStatus): boolean {
  return status === "cancelled";
}

/** Short explanation under the badge for customers. */
export function getCustomerStatusExplanation(status: ServiceRequestStatus): string {
  switch (status) {
    case "pending":
      return "Waiting for a nearby helper to accept.";
    case "accepted":
      return "A helper accepted. They may send a price or head over soon.";
    case "inspection":
      return "Visit or assessment is being scheduled.";
    case "quote_provided":
      return "Review the price your helper sent.";
    case "en_route":
      return "Your helper is on the way to the address you shared.";
    case "in_progress":
      return "Work is underway at your place.";
    case "awaiting_customer":
      return "Your helper marked the work finished. Confirm so the job can close.";
    case "completed":
      return "This job is closed. Thanks for using the app.";
    case "cancelled":
      return "This request was cancelled.";
    default:
      return "";
  }
}

export interface HelperAdvanceAction {
  nextStatus: ServiceRequestStatus;
  label: string;
  customerTitle: string;
  customerBody: string;
}

/**
 * Next action a helper should take for an assigned job (null = no advance button).
 */
export function getHelperAdvanceAction(req: ServiceRequest): HelperAdvanceAction | null {
  if (req.providerId === "unassigned") return null;
  switch (req.status) {
    case "pending":
      return {
        nextStatus: "accepted",
        label: "Accept this job",
        customerTitle: "Helper accepted",
        customerBody: "Your helper accepted the request. They will update you as they go.",
      };
    case "accepted":
      return {
        nextStatus: "en_route",
        label: "On my way",
        customerTitle: "Helper is on the way",
        customerBody: "Your helper is heading to you.",
      };
    case "en_route":
      return {
        nextStatus: "in_progress",
        label: "Started work",
        customerTitle: "Work started",
        customerBody: "Your helper says they have started the job.",
      };
    case "in_progress":
      return {
        nextStatus: "awaiting_customer",
        label: "Work finished — ask customer to confirm",
        customerTitle: "Helper finished — please confirm",
        customerBody: "Your helper marked the job done. Confirm completion in your account when you are satisfied.",
      };
    default:
      return null;
  }
}

export function getHelperWaitingMessage(status: ServiceRequestStatus): string | null {
  if (status === "quote_provided") {
    return "Waiting for the customer to accept or decline your quote.";
  }
  if (status === "awaiting_customer") {
    return "Waiting for the customer to confirm the job is complete.";
  }
  return null;
}
