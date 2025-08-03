import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisService } from "src/redis/redis.service";

@Injectable()
export class MinesweepService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService
  ) {}

  async startGame(userId: string) {
    // const redisKey = `minesweep:start:${userId}`;
    // const lastStart = await this.redisService.get(redisKey);

    // if (lastStart) {
    //   throw new ForbiddenException("Too many requests. Please wait.");
    // }
    // await this.redisService.set(redisKey, userId, { ex: 10 });

    const hasWonGame = await this.checkUserIfAlreadyWon(userId);

    if (hasWonGame) {
      return {
        hasWonGame: true,
        error: "You have already won a game today.",
      };
    }

    const fullBoard = this.generateBoard(5, 5, 20);

    const game = await this.prisma.game_table.create({
      data: {
        member_id: userId,
        game_rows: 5,
        game_cols: 5,
        game_level: "HARD",
        game_total_mines: 10,
        game_status: "IN_PROGRESS",
        game_started_at: new Date(),
        board_cells: {
          create: fullBoard.flat().map((cell) => ({
            cell_x: cell.x,
            cell_y: cell.y,
            cell_is_mine: cell.isMine,
            cell_adjacent_count: cell.adjacentMines,
          })),
        },
      },
      include: { board_cells: false },
    });

    return {
      game_id: game.game_id,
      rows: game.game_rows,
      cols: game.game_cols,
      status: game.game_status,
      hasWonGame,
    };
  }

  async validateTiles(
    game_id: string,
    selections: { x: number; y: number }[],
    memberId: string
  ) {
    if (selections.length !== 3) {
      throw new ForbiddenException("You must select exactly 3 tiles.");
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const cellChecks = await tx.board_cell_table.findMany({
        where: {
          board_game_id: game_id,
          OR: selections.map((s) => ({
            cell_x: s.x,
            cell_y: s.y,
          })),
        },
        select: {
          cell_x: true,
          cell_y: true,
          cell_is_mine: true,
        },
      });

      const hasMine = cellChecks.some((cell) => cell.cell_is_mine);

      await tx.game_table.update({
        where: { game_id: game_id },
        data: {
          game_status: hasMine ? "LOST" : "WON",
          game_ended_at: new Date(),
        },
      });

      return {
        result: hasMine ? "LOST" : "WON",
        revealedTiles: cellChecks,
      };
    });

    if (result.result === "WON") {
      try {
        await this.winWebhook(memberId);
      } catch (err) {
        console.error("Failed to trigger win webhook:", err);
      }
    }

    return result;
  }

  async getGameHistory(userId: string) {
    const games = !!(await this.prisma.game_table.findFirst({
      where: {
        member_id: userId,
        game_status: "WON",
        game_created_at: {
          gte: this.getCurrentDate(new Date(), "start"),
          lte: this.getCurrentDate(new Date(), "end"),
        },
      },
    }));

    const hasWonGame = games;

    return {
      hasWonGame,
    };
  }

  async getGameHistoryAdmin() {
    const games = await this.prisma.game_table.count({
      where: {
        game_status: "WON",
      },
    });

    const totalGames = await this.prisma.game_table.count();

    return {
      gamesWon: games,
      totalGames,
    };
  }

  private generateBoard(rows: number, cols: number, mines: number) {
    const board = Array.from({ length: rows }, (_, x) =>
      Array.from({ length: cols }, (_, y) => ({
        x,
        y,
        isMine: false,
        adjacentMines: 0,
      }))
    );

    let placed = 0;
    while (placed < mines) {
      const x = Math.floor(Math.random() * rows);
      const y = Math.floor(Math.random() * cols);
      if (!board[x][y].isMine) {
        board[x][y].isMine = true;
        this.incrementNeighbors(board, x, y);
        placed++;
      }
    }

    return board;
  }

  private getCurrentDate(date: Date, time: "start" | "end") {
    const philippinesOffset = 8 * 60 * 60 * 1000;
    const adjustedDate = new Date(date.getTime() + philippinesOffset);

    if (time === "start") {
      adjustedDate.setUTCHours(0, 0, 0, 0);
    } else {
      adjustedDate.setUTCHours(23, 59, 59, 999);
    }

    const resultDate = new Date(adjustedDate.getTime() - philippinesOffset);

    return resultDate.toISOString();
  }

  private async checkUserIfAlreadyWon(userId: string) {
    const games = !!(await this.prisma.game_table.findFirst({
      where: {
        member_id: userId,
        game_status: "WON",
        game_created_at: {
          gte: this.getCurrentDate(new Date(), "start"),
          lte: this.getCurrentDate(new Date(), "end"),
        },
      },
    }));
    return games;
  }

  private incrementNeighbors(board: any[][], x: number, y: number) {
    for (const dx of [-1, 0, 1]) {
      for (const dy of [-1, 0, 1]) {
        const nx = x + dx;
        const ny = y + dy;
        if (
          (dx !== 0 || dy !== 0) &&
          nx >= 0 &&
          nx < board.length &&
          ny >= 0 &&
          ny < board[0].length
        ) {
          board[nx][ny].adjacentMines++;
        }
      }
    }
  }

  private async winWebhook(memberId: string) {
    const webhookUrl = process.env.WEBHOOK_URL;

    const data = await fetch(webhookUrl, {
      method: "POST",
      body: JSON.stringify({
        event: "minesweep_win",
        amount: 50,
        memberId: memberId,
      }),
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": process.env.WEBHOOK_SECRET!,
      },
    });

    if (data.status !== 200) {
      throw new Error("Failed to send win webhook");
    }
    const response = await data.json();

    return response;
  }
}
