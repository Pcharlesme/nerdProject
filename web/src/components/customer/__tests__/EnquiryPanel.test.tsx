import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EnquiryPanel } from "../EnquiryPanel";
import { enquiriesApi, ApiError } from "@/api";
import { createQueryWrapper } from "@/test/queryWrapper";

vi.mock("@/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/api")>();
  return { ...actual, enquiriesApi: { createEnquiry: vi.fn() } };
});

async function openPanel(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /something not right/i }));
}

function renderPanel(trackingNumber: string | null = "TRK-DEMO-001") {
  const Wrapper = createQueryWrapper();
  return render(
    <Wrapper>
      <EnquiryPanel trackingNumber={trackingNumber} />
    </Wrapper>,
  );
}

describe("EnquiryPanel", () => {
  beforeEach(() => {
    vi.mocked(enquiriesApi.createEnquiry).mockReset();
  });

  it("scrolls the panel into view when it's opened", async () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;

    const user = userEvent.setup();
    renderPanel();
    await openPanel(user);

    expect(scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ behavior: "smooth", block: "start" }));
  });

  it("blocks submission and shows an inline error when the message is empty", async () => {
    const user = userEvent.setup();
    renderPanel();
    await openPanel(user);

    await user.click(screen.getByRole("button", { name: /send enquiry/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/enter your tracking number and a message/i);
    expect(enquiriesApi.createEnquiry).not.toHaveBeenCalled();
  });

  it("submits and shows a success message", async () => {
    vi.mocked(enquiriesApi.createEnquiry).mockResolvedValue({
      id: "enq-1",
      trackingNumber: "TRK-DEMO-001",
      status: "OPEN",
      createdAt: "2026-09-21T10:15:00Z",
    });

    const user = userEvent.setup();
    renderPanel();
    await openPanel(user);

    await user.type(screen.getByLabelText(/message/i), "Where is my parcel?");
    await user.click(screen.getByRole("button", { name: /send enquiry/i }));

    expect(await screen.findByText(/we've received your enquiry/i)).toBeInTheDocument();
    expect(vi.mocked(enquiriesApi.createEnquiry).mock.calls[0][0]).toEqual(
      expect.objectContaining({ trackingNumber: "TRK-DEMO-001", message: "Where is my parcel?" }),
    );
  });

  it("shows an inline error when the backend rejects the enquiry", async () => {
    vi.mocked(enquiriesApi.createEnquiry).mockRejectedValue(new ApiError("Server error", "INTERNAL_ERROR", 500));

    const user = userEvent.setup();
    renderPanel();
    await openPanel(user);

    await user.type(screen.getByLabelText(/message/i), "Where is my parcel?");
    await user.click(screen.getByRole("button", { name: /send enquiry/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn't send your enquiry/i);
  });
});
