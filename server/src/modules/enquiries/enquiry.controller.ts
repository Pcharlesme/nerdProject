import type { Request, Response } from "express";
import { validatedBody, validatedParams, validatedQuery } from "../../lib/validated";
import * as service from "./enquiry.service";
import type { CreateEnquiryBody, EnquiryIdParams, ListEnquiriesQuery, UpdateEnquiryBody } from "./enquiry.schemas";

export async function createEnquiry(req: Request, res: Response) {
  const enquiry = await service.createEnquiry(validatedBody<CreateEnquiryBody>(req));
  res.status(201).json({
    data: {
      id: enquiry.id,
      trackingNumber: enquiry.trackingNumber,
      status: enquiry.status,
      createdAt: enquiry.createdAt,
    },
  });
}

export async function listEnquiries(req: Request, res: Response) {
  const query = validatedQuery<ListEnquiriesQuery>(req);
  const { enquiries, total } = await service.listEnquiries(query);

  res.json({
    data: enquiries.map(service.toEnquiry),
    meta: { total, page: query.page, limit: query.limit, totalPages: Math.max(1, Math.ceil(total / query.limit)) },
  });
}

export async function updateEnquiry(req: Request, res: Response) {
  const { id } = validatedParams<EnquiryIdParams>(req);
  const enquiry = await service.updateEnquiryStatus(id, validatedBody<UpdateEnquiryBody>(req));
  res.json({ data: service.toEnquiry(enquiry) });
}
