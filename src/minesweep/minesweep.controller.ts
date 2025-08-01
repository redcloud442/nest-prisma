import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt.auth.guard";
import { Rbac } from "src/common/decorators/rbac.decorator";
import { MinesweepService } from "./minesweep.service";

@Controller("minesweep")
export class MinesweepController {
  constructor(private readonly minesweepService: MinesweepService) {}

  @UseGuards(JwtAuthGuard)
  @Post("start")
  async startGame(@Req() req) {
    try {
      const memberId = req.user.user_metadata.CompanyMemberId;
      return await this.minesweepService.startGame(memberId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post("validate")
  async validateTiles(
    @Body() body: { game_id: string; selections: { x: number; y: number }[] },
    @Req() req
  ) {
    try {
      const memberId = req.user.user_metadata.CompanyMemberId;

      return await this.minesweepService.validateTiles(
        body.game_id,
        body.selections,
        memberId
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Rbac(["ADMIN"])
  @Get("history")
  async getGameHistory() {
    try {
      return await this.minesweepService.getGameHistoryAdmin();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
