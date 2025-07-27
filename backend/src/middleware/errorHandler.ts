import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error("Unhandled error: %o", err);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
}
