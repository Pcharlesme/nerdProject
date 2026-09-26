import { apiClient } from "./client";
import { toApiError } from "./errors";
import type {
  ApiEnvelope,
  CreateEnquiryRequest,
  CreateEnquiryResponse,
  ListEnquiriesParams,
  PaginatedEnvelope,
  UpdateEnquiryStatusRequest,
} from "./types";
import type { Enquiry } from "@/types";

/** POST /api/enquiries — public, no auth, rate limited on the server. */
export async function createEnquiry(body: CreateEnquiryRequest): Promise<CreateEnquiryResponse> {
  try {
    const res = await apiClient.post<ApiEnvelope<CreateEnquiryResponse>>("/enquiries", body);
    return res.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

/** GET /api/staff/enquiries — newest first. */
export async function listStaffEnquiries(
  params: ListEnquiriesParams,
): Promise<{ enquiries: Enquiry[]; meta: PaginatedEnvelope<Enquiry>["meta"] }> {
  try {
    const res = await apiClient.get<PaginatedEnvelope<Enquiry>>("/staff/enquiries", { params });
    return { enquiries: res.data.data, meta: res.data.meta };
  } catch (error) {
    throw toApiError(error);
  }
}

/** PATCH /api/staff/enquiries/:id — resolve or reopen. */
export async function updateEnquiryStatus(id: string, body: UpdateEnquiryStatusRequest): Promise<Enquiry> {
  try {
    const res = await apiClient.patch<ApiEnvelope<Enquiry>>(`/staff/enquiries/${encodeURIComponent(id)}`, body);
    return res.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}
