// common/middlewares/error.middleware.ts

import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Response } from "express";
@Injectable()
export class ErrorMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    try {
      next();
    } catch (error) {
      console.log(error);
    }
  }
}
