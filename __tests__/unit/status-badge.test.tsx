// __tests__/unit/status-badge.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/ui/status-badge";

describe("StatusBadge", () => {
  it("renders 'To do' for TODO status", () => {
    render(<StatusBadge status="TODO" />);
    expect(screen.getByText("To do")).toBeInTheDocument();
  });

  it("renders 'In progress' for IN_PROGRESS", () => {
    render(<StatusBadge status="IN_PROGRESS" />);
    expect(screen.getByText("In progress")).toBeInTheDocument();
  });

  it("renders 'Done' for DONE", () => {
    render(<StatusBadge status="DONE" />);
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("renders 'Blocked' for BLOCKED", () => {
    render(<StatusBadge status="BLOCKED" />);
    expect(screen.getByText("Blocked")).toBeInTheDocument();
  });

  it("renders 'In review' for IN_REVIEW", () => {
    render(<StatusBadge status="IN_REVIEW" />);
    expect(screen.getByText("In review")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <StatusBadge status="DONE" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
