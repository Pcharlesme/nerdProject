import Joi from "joi";
import type { ShipmentStatus } from "@prisma/client";
import { SHIPMENT_STATUSES, TRACKING_NUMBER_PATTERN } from "../../lib/domain";

// ==== Shared fields ====

const trackingNumber = Joi.string()
  .trim()
  .uppercase()
  .pattern(TRACKING_NUMBER_PATTERN)
  .messages({ "string.pattern.base": "trackingNumber must be 6-32 letters, numbers or dashes" });

const shortText = (max = 120) => Joi.string().trim().max(max);
const status = Joi.string().valid(...SHIPMENT_STATUSES);

const contact = Joi.object({
  name: shortText().required(),
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .max(254)
    .empty(""),
  phone: shortText(40).empty(""),
  address: shortText(240).empty(""),
});

// ==== Params & query ====

export interface TrackingNumberParams {
  trackingNumber: string;
}

export const trackingNumberParamsSchema = Joi.object<TrackingNumberParams>({
  trackingNumber: trackingNumber.required(),
});

export interface ListShipmentsQuery {
  search?: string;
  status?: ShipmentStatus;
  order: "asc" | "desc";
  page: number;
  limit: number;
}

export const listShipmentsQuerySchema = Joi.object<ListShipmentsQuery>({
  search: Joi.string()
    .trim()
    .max(64)
    .pattern(/^[A-Za-z0-9 -]*$/)
    .empty("")
    .messages({ "string.pattern.base": "search may only contain letters, numbers, spaces or dashes" }),
  status,
  order: Joi.string().valid("asc", "desc").default("desc"),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

// ==== Bodies ====

export interface ContactInput {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface CreateShipmentBody {
  trackingNumber?: string;
  originCity: string;
  originRegion: string;
  destinationCity: string;
  destinationRegion: string;
  currentLocation: string;
  estimatedDeliveryAt: Date;
  etaNote?: string;
  serviceLevel: string;
  packageCount: number;
  weightKg: number;
  referenceCode: string;
  sender: ContactInput;
  receiver: ContactInput;
}

export const createShipmentSchema = Joi.object<CreateShipmentBody>({
  trackingNumber: trackingNumber.empty(""),
  originCity: shortText().required(),
  originRegion: shortText().allow("").default(""),
  destinationCity: shortText().required(),
  destinationRegion: shortText().allow("").default(""),
  currentLocation: shortText(160).required(),
  estimatedDeliveryAt: Joi.date().iso().required(),
  etaNote: shortText(280).empty(""),
  serviceLevel: shortText(60).empty("").default("Standard"),
  packageCount: Joi.number().integer().min(1).max(999).required(),
  weightKg: Joi.number().positive().max(100000).precision(2).required(),
  referenceCode: shortText(60).required(),
  sender: contact.required(),
  receiver: contact.required(),
});

export type UpdateShipmentBody = Partial<
  Pick<
    CreateShipmentBody,
    | "originCity"
    | "originRegion"
    | "destinationCity"
    | "destinationRegion"
    | "currentLocation"
    | "estimatedDeliveryAt"
    | "serviceLevel"
    | "packageCount"
    | "weightKg"
    | "referenceCode"
  >
> & { etaNote?: string | null };

export const updateShipmentSchema = Joi.object<UpdateShipmentBody>({
  originCity: shortText(),
  originRegion: shortText().allow(""),
  destinationCity: shortText(),
  destinationRegion: shortText().allow(""),
  currentLocation: shortText(160),
  estimatedDeliveryAt: Joi.date().iso(),
  etaNote: shortText(280).allow("", null),
  serviceLevel: shortText(60),
  packageCount: Joi.number().integer().min(1).max(999),
  weightKg: Joi.number().positive().max(100000).precision(2),
  referenceCode: shortText(60),
})
  .min(1)
  .messages({ "object.min": "Provide at least one field to update" });

export interface ChangeStatusBody {
  status: ShipmentStatus;
  message?: string;
  location?: string;
}

export const changeStatusSchema = Joi.object<ChangeStatusBody>({
  status: status.required(),
  message: shortText(500).empty(""),
  location: shortText(160).empty(""),
});

export interface AddEventBody {
  occurredAt: Date;
  location: string;
  message: string;
  status?: ShipmentStatus;
}

export const addEventSchema = Joi.object<AddEventBody>({
  occurredAt: Joi.date().iso().max("now").required().messages({ "date.max": "occurredAt cannot be in the future" }),
  location: shortText(160).required(),
  message: shortText(500).required(),
  status,
});

export interface AddNoteBody {
  message: string;
}

export const addNoteSchema = Joi.object<AddNoteBody>({
  message: shortText(2000).required(),
});
