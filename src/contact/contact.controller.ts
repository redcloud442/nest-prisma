import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { User } from "@supabase/supabase-js";
import { JwtAuthGuard } from "src/auth/guards/jwt.auth.guard";
import { Rbac } from "src/common/decorators/rbac.decorator";
import { CustomZodPipe } from "src/common/function/function";
import { RbacGuard } from "src/common/guard/rbac.guard";
import { ContactService } from "./contact.service";
import { CreateContactFormDto } from "./dto/dto";

@Controller("contact")
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get("/get-all")
  @Rbac(["MEMBER"])
  @UseGuards(JwtAuthGuard, RbacGuard)
  async getAllContact(
    @Req() req: Request & { user: User },
    @Query("take") take: number,
    @Query("skip") skip: number
  ) {
    try {
      const user = req.user.user_metadata;

      const data = await this.contactService.getAllContact(
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

  @Post("/create-contact")
  @Rbac(["MEMBER"])
  @UseGuards(JwtAuthGuard, RbacGuard)
  async createContact(
    @Req() req: Request & { user: User },
    @Body(CustomZodPipe(CreateContactFormDto))
    body: CreateContactFormDto
  ) {
    try {
      const user = req.user.user_metadata;

      const { name, fbLink, category } = body;

      const data = await this.contactService.createContact(
        {
          name,
          fbLink,
          category,
        },
        user.sub
      );

      return data;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Put("/delete-contact/:id")
  @Rbac(["MEMBER"])
  @UseGuards(JwtAuthGuard, RbacGuard)
  async deleteContact(
    @Req() req: Request & { user: User },
    @Param("id") id: string
  ) {
    try {
      const user = req.user.user_metadata;
      const data = await this.contactService.deleteContact(id, user.sub);

      return data;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
