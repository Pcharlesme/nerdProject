import { Router } from "express";
import { validate } from "../../middleware/validate";
import { enquiryLimiter } from "../../middleware/rateLimiters";
import * as controller from "./enquiry.controller";
import {
  createEnquirySchema,
  enquiryIdParamsSchema,
  listEnquiriesQuerySchema,
  updateEnquirySchema,
} from "./enquiry.schemas";

export const publicEnquiryRouter = Router();

publicEnquiryRouter.post("/", enquiryLimiter, validate({ body: createEnquirySchema }), controller.createEnquiry);

export const staffEnquiryRouter = Router();

staffEnquiryRouter.get("/", validate({ query: listEnquiriesQuerySchema }), controller.listEnquiries);
staffEnquiryRouter.patch(
  "/:id",
  validate({ params: enquiryIdParamsSchema, body: updateEnquirySchema }),
  controller.updateEnquiry,
);
