import { Router } from "express";
import { validate } from "../../middleware/validate";
import * as controller from "./shipment.controller";
import {
  addEventSchema,
  addNoteSchema,
  changeStatusSchema,
  createShipmentSchema,
  listShipmentsQuerySchema,
  trackingNumberParamsSchema,
  updateShipmentSchema,
} from "./shipment.schemas";

const params = trackingNumberParamsSchema;

export const publicShipmentRouter = Router();

publicShipmentRouter.get("/:trackingNumber", validate({ params }), controller.getPublicShipment);

export const staffShipmentRouter = Router();

staffShipmentRouter.get("/", validate({ query: listShipmentsQuerySchema }), controller.listShipments);
staffShipmentRouter.post("/", validate({ body: createShipmentSchema }), controller.createShipment);
staffShipmentRouter.get("/:trackingNumber", validate({ params }), controller.getStaffShipment);
staffShipmentRouter.patch(
  "/:trackingNumber",
  validate({ params, body: updateShipmentSchema }),
  controller.updateShipment,
);
staffShipmentRouter.patch(
  "/:trackingNumber/status",
  validate({ params, body: changeStatusSchema }),
  controller.changeStatus,
);
staffShipmentRouter.post(
  "/:trackingNumber/events",
  validate({ params, body: addEventSchema }),
  controller.addTrackingEvent,
);
staffShipmentRouter.post(
  "/:trackingNumber/notes",
  validate({ params, body: addNoteSchema }),
  controller.addInternalNote,
);
