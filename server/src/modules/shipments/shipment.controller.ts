import type { Request, Response } from "express";
import { AppError } from "../../lib/AppError";
import { validatedBody, validatedParams, validatedQuery } from "../../lib/validated";
import * as service from "./shipment.service";
import { toPublicShipment, toShipmentSummary, toStaffShipment } from "./shipment.serializers";
import type {
  AddEventBody,
  AddNoteBody,
  ChangeStatusBody,
  CreateShipmentBody,
  ListShipmentsQuery,
  TrackingNumberParams,
  UpdateShipmentBody,
} from "./shipment.schemas";

const trackingNumberOf = (req: Request) => validatedParams<TrackingNumberParams>(req).trackingNumber;

// ==== Public ====

export async function getPublicShipment(req: Request, res: Response) {
  const shipment = await service.getPublicShipment(trackingNumberOf(req));
  res.json({ data: toPublicShipment(shipment) });
}

// ==== Staff ====

export async function listShipments(req: Request, res: Response) {
  const query = validatedQuery<ListShipmentsQuery>(req);
  const { shipments, total } = await service.listShipments(query);

  res.json({
    data: shipments.map(toShipmentSummary),
    meta: { total, page: query.page, limit: query.limit, totalPages: Math.max(1, Math.ceil(total / query.limit)) },
  });
}

export async function getStaffShipment(req: Request, res: Response) {
  const shipment = await service.getStaffShipment(trackingNumberOf(req));
  res.json({ data: toStaffShipment(shipment) });
}

export async function createShipment(req: Request, res: Response) {
  const shipment = await service.createShipment(validatedBody<CreateShipmentBody>(req));
  res
    .status(201)
    .location(`/api/staff/shipments/${shipment.trackingNumber}`)
    .json({ data: toStaffShipment(shipment) });
}

export async function updateShipment(req: Request, res: Response) {
  const shipment = await service.updateShipment(trackingNumberOf(req), validatedBody<UpdateShipmentBody>(req));
  res.json({ data: toStaffShipment(shipment) });
}

export async function changeStatus(req: Request, res: Response) {
  const shipment = await service.changeStatus(trackingNumberOf(req), validatedBody<ChangeStatusBody>(req));
  res.json({ data: toStaffShipment(shipment) });
}

export async function addTrackingEvent(req: Request, res: Response) {
  const shipment = await service.addTrackingEvent(trackingNumberOf(req), validatedBody<AddEventBody>(req));
  res.status(201).json({ data: toStaffShipment(shipment) });
}

export async function addInternalNote(req: Request, res: Response) {
  if (!req.staff) throw AppError.unauthenticated();
  const { message } = validatedBody<AddNoteBody>(req);
  const shipment = await service.addInternalNote(trackingNumberOf(req), message, req.staff.id);
  res.status(201).json({ data: toStaffShipment(shipment) });
}
