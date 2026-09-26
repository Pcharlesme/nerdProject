import Joi from "joi";
import type { EnquiryCategory, EnquiryStatus } from "@prisma/client";
import { ENQUIRY_CATEGORIES, ENQUIRY_STATUSES, TRACKING_NUMBER_PATTERN } from "../../lib/domain";

export interface CreateEnquiryBody {
  trackingNumber: string;
  category: EnquiryCategory;
  message: string;
  contactEmail?: string;
}

export const createEnquirySchema = Joi.object<CreateEnquiryBody>({
  trackingNumber: Joi.string()
    .trim()
    .uppercase()
    .pattern(TRACKING_NUMBER_PATTERN)
    .required()
    .messages({ "string.pattern.base": "trackingNumber must be 6-32 letters, numbers or dashes" }),
  category: Joi.string()
    .valid(...ENQUIRY_CATEGORIES)
    .required(),
  message: Joi.string().trim().min(5).max(2000).required(),
  contactEmail: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .max(254)
    .empty(""),
});

export interface ListEnquiriesQuery {
  status?: EnquiryStatus;
  page: number;
  limit: number;
}

export const listEnquiriesQuerySchema = Joi.object<ListEnquiriesQuery>({
  status: Joi.string().valid(...ENQUIRY_STATUSES),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
});

export interface EnquiryIdParams {
  id: string;
}

export const enquiryIdParamsSchema = Joi.object<EnquiryIdParams>({
  id: Joi.string().guid({ version: "uuidv4" }).required().messages({ "string.guid": "id is not a valid enquiry id" }),
});

export interface UpdateEnquiryBody {
  status: EnquiryStatus;
}

export const updateEnquirySchema = Joi.object<UpdateEnquiryBody>({
  status: Joi.string()
    .valid(...ENQUIRY_STATUSES)
    .required(),
});
