import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { BottomNav } from "./BottomNav";

const renderWithRouter = (initialPath = "/") =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <BottomNav />
    </MemoryRouter>
  );

describe("BottomNav", () => {
  it("renders all nav labels", () => {
    renderWithRouter();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Explore")).toBeInTheDocument();
    expect(screen.getByText("Messages")).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
  });

  it("renders 5 navigation links", () => {
    renderWithRouter();
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(5);
  });

  it("marks Home link as active on root path", () => {
    renderWithRouter("/");
    const homeLink = screen.getByText("Home").closest("a");
    expect(homeLink).toHaveClass("text-blue-600");
  });

  it("marks Explore link as active on /discover path", () => {
    renderWithRouter("/discover");
    const exploreLink = screen.getByText("Explore").closest("a");
    expect(exploreLink).toHaveClass("text-blue-600");
  });

  it("center request button links to /request", () => {
    renderWithRouter();
    const links = screen.getAllByRole("link");
    const requestLink = links.find((l) => l.getAttribute("href") === "/request");
    expect(requestLink).toBeDefined();
  });
});
