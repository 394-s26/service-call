import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { AppProvider, useAppContext } from "../hooks/useAppContext";
import { AuthProvider } from "../hooks/useAuth";
import { ProviderDetail } from "./ProviderDetail";
import { Request } from "./Request";
import type { ServiceProvider } from "../types";

const mockUser = {
  uid: "user-1",
  displayName: "Test User",
  email: "test@example.com",
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
};

const RequestStateProbe = () => {
  const location = useLocation();
  return (
    <div data-testid="request-state">
      {JSON.stringify(location.state ?? null)}
    </div>
  );
};

const RequestsProbe = () => {
  const { requests } = useAppContext();
  return (
    <ul data-testid="requests-list">
      {requests.map((r) => (
        <li key={r.id} data-provider-id={r.providerId}>
          {r.description}
        </li>
      ))}
    </ul>
  );
};

const AppTestShell = ({
  initialEntries,
  children,
}: {
  initialEntries: string[];
  children: React.ReactNode;
}) => (
  <MemoryRouter initialEntries={initialEntries}>
    <AuthProvider>
      <AppProvider>{children}</AppProvider>
    </AuthProvider>
  </MemoryRouter>
);

describe("Service request flow", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("servicecall_local_user", JSON.stringify(mockUser));
    localStorage.setItem(
      "servicecall_marketplace_providers",
      JSON.stringify([mockProvider])
    );
    localStorage.setItem("servicecall_marketplace_requests", "[]");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("navigates to /request with the provider id when Book is clicked", async () => {
    const user = userEvent.setup();

    render(
      <AppTestShell initialEntries={["/provider/prov-1"]}>
        <Routes>
          <Route path="/provider/:id" element={<ProviderDetail />} />
          <Route
            path="/request"
            element={
              <>
                <RequestStateProbe />
                <Request />
              </>
            }
          />
        </Routes>
      </AppTestShell>
    );

    await waitFor(() => {
      expect(screen.getByText("Jane's Electric")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Book/i }));

    await waitFor(() => {
      expect(screen.getByTestId("request-state")).toHaveTextContent(
        JSON.stringify({ providerId: "prov-1" })
      );
    });
  });

  it("stores a service request for the selected provider after submit", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <AppTestShell initialEntries={["/request"]}>
        <Routes>
          <Route
            path="/request"
            element={
              <>
                <RequestsProbe />
                <Request />
              </>
            }
          />
        </Routes>
      </AppTestShell>
    );

    await user.click(
      screen.getByRole("button", {
        name: /Open request \(faster responses\)/i,
      })
    );
    await user.click(screen.getByRole("button", { name: /Quick Fixes/i }));
    await user.type(
      screen.getByPlaceholderText(/Running faucet/i),
      "Need help fixing a kitchen outlet"
    );
    await user.click(
      screen.getByRole("button", { name: /See Nearby Helpers/i })
    );

    await user.click(screen.getByText("Jane's Electric"));
    await user.click(screen.getByRole("button", { name: /Choose a Helper/i }));
    await user.click(screen.getByRole("button", { name: /Confirm Helper/i }));

    await user.type(
      screen.getByPlaceholderText(/123 Main St/i),
      "123 Main St, Brooklyn, NY 11201"
    );
    await user.click(screen.getByRole("button", { name: /Review & Confirm/i }));
    await user.click(screen.getByRole("button", { name: /Submit Request/i }));
    await vi.advanceTimersByTimeAsync(1300);

    await waitFor(() => {
      expect(screen.getByText("Request Posted!")).toBeInTheDocument();
    });

    const requestItem = screen
      .getByTestId("requests-list")
      .querySelector('[data-provider-id="prov-1"]');
    expect(requestItem).toBeTruthy();
    expect(requestItem).toHaveTextContent("Need help fixing a kitchen outlet");
  });
});
