import Joi from "joi";

export const MAX_RANGE_DAYS = 92;
export const DEFAULT_RANGE_DAYS = 14;

export interface DeliveryPerformanceQuery {
  from?: string;
  to?: string;
}

const isoDay = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .messages({ "string.pattern.base": "{#label} must be a date in YYYY-MM-DD format" });

export const deliveryPerformanceQuerySchema = Joi.object<DeliveryPerformanceQuery>({
  from: isoDay,
  to: isoDay,
});
