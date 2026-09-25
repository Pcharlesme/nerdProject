import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TrackingSearch } from "../TrackingSearch";

describe("TrackingSearch", () => {
  it("blocks submission and shows an inline error when the field is empty", async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    render(<TrackingSearch onSearch={onSearch} />);

    await user.click(screen.getByRole("button", { name: "Track" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/enter a tracking number/i);
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("blocks submission and shows an inline error for an unsupported format", async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    render(<TrackingSearch onSearch={onSearch} />);

    await user.type(screen.getByLabelText(/tracking number/i), "!!");
    await user.click(screen.getByRole("button", { name: "Track" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/doesn't look like a valid tracking number/i);
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("calls onSearch with the trimmed value for a valid tracking number", async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    render(<TrackingSearch onSearch={onSearch} />);

    await user.type(screen.getByLabelText(/tracking number/i), "  TRK-DEMO-001  ");
    await user.click(screen.getByRole("button", { name: "Track" }));

    expect(onSearch).toHaveBeenCalledWith("TRK-DEMO-001");
  });

  it("disables the button and shows a searching label while loading", () => {
    render(<TrackingSearch onSearch={vi.fn()} loading />);

    const button = screen.getByRole("button", { name: /searching/i });
    expect(button).toBeDisabled();
  });
});
