import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { User } from "@supabase/supabase-js";
import { JwtAuthGuard } from "src/auth/guards/jwt.auth.guard";
import { Rbac } from "src/common/decorators/rbac.decorator";
import { CustomZodPipe } from "src/common/function/function";
import { RbacGuard } from "src/common/guard/rbac.guard";
import { SendNotificationFormDto } from "./dto/dto";
import { NotificationsService } from "./notifications.service";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notifService: NotificationsService) {}

  @Get("/get-all")
  @Rbac(["MEMBER"])
  @UseGuards(JwtAuthGuard, RbacGuard)
  async getNotification(
    @Req() req: Request & { user: User },
    @Query("take") take: number,
    @Query("skip") skip: number
  ) {
    try {
      const user = req.user.user_metadata;

      const data = await this.notifService.getNotification(
        user.sub,
        Number(take),
        Number(skip)
      );

      return data;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Post("send")
  @Rbac(["MEMBER"])
  @UseGuards(JwtAuthGuard, RbacGuard)
  async sendToUser(
    @Body(CustomZodPipe(SendNotificationFormDto)) body: SendNotificationFormDto
  ) {
    try {
      const data = await this.notifService.sendToUser(body);

      return data;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Post("broadcast")
  @Rbac(["MEMBER"])
  @UseGuards(JwtAuthGuard, RbacGuard)
  async broadcast(
    @Body(CustomZodPipe(SendNotificationFormDto)) body: SendNotificationFormDto
  ) {
    try {
      const data = await this.notifService.broadcast(body);

      return data;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
