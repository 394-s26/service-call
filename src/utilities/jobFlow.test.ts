import { describe, it, expect } from "vitest";
import { getPipelineStepIndex, getHelperAdvanceAction } from "./jobFlow";
import type { ServiceRequest } from "../types";

const baseReq = (overrides: Partial<ServiceRequest>): ServiceRequest => ({
  id: "r1",
  userId: "u1",
  providerId: "p1",
  categoryId: "quick_fixes",
  description: "Test",
  status: "pending",
  createdAt: new Date(),
  updatedAt: new Date(),
  address: "NY",
  ...overrides,
});

describe("getPipelineStepIndex", () => {
  it("maps statuses to customer pipeline indices", () => {
    expect(getPipelineStepIndex("pending")).toBe(0);
    expect(getPipelineStepIndex("accepted")).toBe(1);
    expect(getPipelineStepIndex("en_route")).toBe(2);
    expect(getPipelineStepIndex("in_progress")).toBe(3);
    expect(getPipelineStepIndex("awaiting_customer")).toBe(4);
    expect(getPipelineStepIndex("completed")).toBe(4);
  });
});

describe("getHelperAdvanceAction", () => {
  it("returns null for unassigned jobs", () => {
    expect(getHelperAdvanceAction(baseReq({ providerId: "unassigned" }))).toBeNull();
  });

  it("returns accept action for pending assigned jobs", () => {
    const a = getHelperAdvanceAction(baseReq({ status: "pending" }));
    expect(a?.nextStatus).toBe("accepted");
  });
});
