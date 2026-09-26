import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UpdateStatusPanel } from "../UpdateStatusPanel";
import { shipmentsApi, ApiError } from "@/api";
import { createQueryWrapper } from "@/test/queryWrapper";
import { makeStaffShipment } from "@/test/fixtures";

vi.mock("@/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/api")>();
  return { ...actual, shipmentsApi: { changeShipmentStatus: vi.fn() } };
});

function renderPanel(status: "IN_TRANSIT" | "DELIVERED" = "IN_TRANSIT") {
  const Wrapper = createQueryWrapper();
  const shipment = makeStaffShipment({ trackingNumber: "TRK-DEMO-001", status });
  return render(
    <Wrapper>
      <UpdateStatusPanel shipment={shipment} />
    </Wrapper>,
  );
}

describe("UpdateStatusPanel", () => {
  beforeEach(() => {
    vi.mocked(shipmentsApi.changeShipmentStatus).mockReset();
  });

  it("rejects submitting the shipment's current status", async () => {
    const user = userEvent.setup();
    renderPanel("IN_TRANSIT");
    await user.click(screen.getByRole("button", { name: /update status/i }));

    await user.selectOptions(screen.getByLabelText(/new status/i), "IN_TRANSIT");
    await user.click(screen.getByRole("button", { name: /^update status$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/choose a different status/i);
    expect(shipmentsApi.changeShipmentStatus).not.toHaveBeenCalled();
  });

  it("submits a new status and shows success", async () => {
    vi.mocked(shipmentsApi.changeShipmentStatus).mockResolvedValue(
      makeStaffShipment({ trackingNumber: "TRK-DEMO-001", status: "DELIVERED" }),
    );

    const user = userEvent.setup();
    renderPanel("IN_TRANSIT");
    await user.click(screen.getByRole("button", { name: /update status/i }));

    await user.selectOptions(screen.getByLabelText(/new status/i), "DELIVERED");
    await user.click(screen.getByRole("button", { name: /^update status$/i }));

    expect(await screen.findByText(/status updated/i)).toBeInTheDocument();
    expect(shipmentsApi.changeShipmentStatus).toHaveBeenCalledWith("TRK-DEMO-001", { status: "DELIVERED" });
  });

  it("shows an inline error when the backend rejects the change", async () => {
    vi.mocked(shipmentsApi.changeShipmentStatus).mockRejectedValue(new ApiError("Server error", "INTERNAL_ERROR", 500));

    const user = userEvent.setup();
    renderPanel("IN_TRANSIT");
    await user.click(screen.getByRole("button", { name: /update status/i }));

    await user.selectOptions(screen.getByLabelText(/new status/i), "DELIVERED");
    await user.click(screen.getByRole("button", { name: /^update status$/i }));

    expect(await screen.findByText("Server error")).toBeInTheDocument();
  });
});
