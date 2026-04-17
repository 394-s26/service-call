import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchBar } from "./SearchBar";

describe("SearchBar", () => {
  it("renders with default placeholder", () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(screen.getByPlaceholderText("Search services near you…")).toBeInTheDocument();
  });

  it("renders with custom placeholder", () => {
    render(<SearchBar placeholder="Find a plumber..." onSearch={vi.fn()} />);
    expect(screen.getByPlaceholderText("Find a plumber...")).toBeInTheDocument();
  });

  it("calls onSearch with input value", () => {
    const handleSearch = vi.fn();
    render(<SearchBar onSearch={handleSearch} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "plumbing" } });
    expect(handleSearch).toHaveBeenCalledWith("plumbing");
  });

  it("shows clear control after typing", () => {
    render(<SearchBar onSearch={vi.fn()} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "x" } });
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});