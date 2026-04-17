import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders pending status", () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText("Posted")).toBeInTheDocument();
  });

  it("renders in_progress status with correct label", () => {
    render(<StatusBadge status="in_progress" />);
    expect(screen.getByText("Working")).toBeInTheDocument();
  });

  it("renders completed status", () => {
    render(<StatusBadge status="completed" />);
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("renders en_route status", () => {
    render(<StatusBadge status="en_route" />);
    expect(screen.getByText("On the way")).toBeInTheDocument();
  });

  it("renders cancelled status", () => {
    render(<StatusBadge status="cancelled" />);
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
  });
});
