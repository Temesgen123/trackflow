// __tests__/unit/progress-bar.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "@/components/ui/progress-bar";

describe("ProgressBar", () => {
  it("renders the percentage label", () => {
    render(<ProgressBar value={75} />);
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(<ProgressBar value={50} label="Sprint progress" />);
    expect(screen.getByText("Sprint progress")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("hides percentage when showPercent is false", () => {
    render(<ProgressBar value={60} showPercent={false} />);
    expect(screen.queryByText("60%")).not.toBeInTheDocument();
  });

  it("caps fill width at 100%", () => {
    const { container } = render(<ProgressBar value={120} />);
    const fill = container.querySelector(".h-full");
    expect(fill).toHaveStyle("width: 100%");
  });

  it("renders 0% when value is 0", () => {
    render(<ProgressBar value={0} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });
});
