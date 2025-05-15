import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AppService } from "./app.service";
import { JwtAuthGuard } from "./common/guards/jwt.auth.guard";

@Controller()
@ApiTags("/api")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("/protected")
  @UseGuards(JwtAuthGuard)
  async protected(@Req() req) {
    return { message: "AuthGuard works 🎉", authenticated_user: req.user };
  }
}
