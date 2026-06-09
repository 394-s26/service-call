import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppProvider, useAppContext } from "../hooks/useAppContext";
import { AuthProvider } from "../hooks/useAuth";
import { BusinessDashboard } from "./BusinessDashboard";
import { Account } from "./Account";
import type { ServiceProvider, ServiceRequest, User } from "../types";

let mockRequests: ServiceRequest[] = [];
let onRequestsUpdate: ((requests: ServiceRequest[]) => void) | null = null;

const notifyRequestSubscribers = () => {
  onRequestsUpdate?.(mockRequests.map((r) => ({ ...r })));
};

vi.mock("../services/authService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../services/authService")>();
  return {
    ...actual,
    onAuthChange: (callback: (user: User | null) => void) => {
      try {
        const raw = localStorage.getItem("servicecall_local_user");
        callback(raw ? (JSON.parse(raw) as User) : null);
      } catch {
        callback(null);
      }
      return () => {};
    },
  };
});

vi.mock("../services/firebase", () => ({
  isFirebaseConfigured: true,
  auth: {},
  db: {},
  app: {},
  googleProvider: {},
}));

const firestoreProviderDoc = () => ({
  id: mockProvider.id,
  data: () => ({ ...mockProvider }),
});

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  onSnapshot: vi.fn((_ref, cb) => {
    cb({ docs: [firestoreProviderDoc()] });
    return () => {};
  }),
  query: vi.fn(),
  where: vi.fn(),
  addDoc: vi.fn(),
  serverTimestamp: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
}));

vi.mock("../services/userProfileService", () => ({
  updateUserLastKnownLocation: vi.fn(),
}));

vi.mock("../services/serviceRequestFirestore", () => ({
  createServiceRequest: vi.fn(),
  updateServiceRequestDocument: vi.fn(),
  subscribeServiceRequests: vi.fn(),
}));

import {
  createServiceRequest,
  updateServiceRequestDocument,
  subscribeServiceRequests,
} from "../services/serviceRequestFirestore";

vi.mocked(subscribeServiceRequests).mockImplementation((_userId, _ownedIds, onUpdate) => {
  onRequestsUpdate = onUpdate;
  notifyRequestSubscribers();
  return () => {
    onRequestsUpdate = null;
  };
});

vi.mocked(createServiceRequest).mockImplementation(async (req) => {
  const id = "id" in req && typeof req.id === "string" ? req.id : "req-1";
  const full: ServiceRequest = {
    ...(req as ServiceRequest),
    id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockRequests = [full, ...mockRequests.filter((r) => r.id !== id)];
  notifyRequestSubscribers();
  return id;
});

vi.mocked(updateServiceRequestDocument).mockImplementation(async (id, updates) => {
  mockRequests = mockRequests.map((r) =>
    r.id === id ? ({ ...r, ...updates, updatedAt: new Date() } as ServiceRequest) : r
  );
  notifyRequestSubscribers();
});

const mockHelper: User = {
  uid: "helper-1",
  displayName: "Helper User",
  email: "helper@example.com",
  photoURL: null,
};

const mockCustomer: User = {
  uid: "customer-1",
  displayName: "Customer User",
  email: "customer@example.com",
  photoURL: null,
};

const mockProvider: ServiceProvider = {
  id: "prov-1",
  name: "Jane's Electric",
  businessName: "Jane's Electric",
  category: "quick_fixes",
  categories: ["quick_fixes"],
  rating: 4.9,
  reviewCount: 25,
  inspectionFee: 50,
  available: true,
  location: "Brooklyn, NY",
  distanceMiles: 2.1,
  imageUrl: "https://example.com/img.jpg",
  specialties: ["Wiring"],
  ownerUid: "helper-1",
};

const baseRequest = (
  overrides: Partial<ServiceRequest> = {}
): ServiceRequest => ({
  id: "req-1",
  userId: "customer-1",
  providerId: "prov-1",
  categoryId: "quick_fixes",
  description: "Fix kitchen outlet",
  status: "pending",
  createdAt: new Date("2026-06-01T10:00:00"),
  updatedAt: new Date("2026-06-01T10:00:00"),
  address: "123 Main St, Brooklyn, NY 11201",
  inspectionFee: 50,
  ...overrides,
});

const RequestStatusProbe = ({ requestId }: { requestId: string }) => {
  const { requests } = useAppContext();
  const request = requests.find((r) => r.id === requestId);
  return (
    <div data-testid="request-status">{request?.status ?? "missing"}</div>
  );
};

describe("Task progress updates", () => {
  beforeEach(() => {
    localStorage.clear();
    mockRequests = [];
    onRequestsUpdate = null;
    vi.clearAllMocks();
    vi.mocked(subscribeServiceRequests).mockImplementation((_userId, _ownedIds, onUpdate) => {
      onRequestsUpdate = onUpdate;
      notifyRequestSubscribers();
      return () => {
        onRequestsUpdate = null;
      };
    });
  });

  it("lets a helper advance task progress after a request is assigned", async () => {
    localStorage.setItem("servicecall_local_user", JSON.stringify(mockHelper));
    mockRequests = [baseRequest()];

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AuthProvider>
          <AppProvider>
            <RequestStatusProbe requestId="req-1" />
            <BusinessDashboard />
          </AppProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("request-status")).toHaveTextContent("pending");
    });

    await waitFor(() => {
      expect(screen.getByText(/My Profile \(1\)/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Requests/i }));

    await waitFor(() => {
      expect(screen.getByText("Fix kitchen outlet")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Accept this job/i }));

    await waitFor(() => {
      expect(screen.getByTestId("request-status")).toHaveTextContent("accepted");
    });

    await user.click(screen.getByRole("button", { name: /On my way/i }));

    await waitFor(() => {
      expect(screen.getByTestId("request-status")).toHaveTextContent("en_route");
    });
  });

  it("lets a customer confirm progress and close the job after helper marks it finished", async () => {
    localStorage.setItem("servicecall_local_user", JSON.stringify(mockCustomer));
    mockRequests = [baseRequest({ status: "awaiting_customer" })];

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AuthProvider>
          <AppProvider>
            <RequestStatusProbe requestId="req-1" />
            <Account />
          </AppProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("request-status")).toHaveTextContent(
        "awaiting_customer"
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Fix kitchen outlet")).toBeInTheDocument();
    });

    expect(screen.getByText("Progress")).toBeInTheDocument();
    expect(screen.getByText("Confirm the job is finished")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /Confirm job complete/i })
    );

    await waitFor(() => {
      expect(screen.getByTestId("request-status")).toHaveTextContent("completed");
    });
  });
});
