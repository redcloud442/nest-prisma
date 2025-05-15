// common/middlewares/logger.middleware.ts

import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Response } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - startTime;
      console.log(
        `${req.method} ${req.url} ${res.statusCode} ${duration}ms res.body: ${res.statusMessage}`
      );
    });
    res.on("error", (error) => {
      console.error(error);
    });
    res.on("close", () => {});
    next();
  }
}
