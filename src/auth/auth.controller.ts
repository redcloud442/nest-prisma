import { Body, Controller, Post, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "src/common/pipes/zod-validation.pipe";
import { AuthService } from "./auth.service";
import { CreateUserDto, CreateUserSchema } from "./dto/auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  @UsePipes(new ZodValidationPipe(CreateUserSchema))
  signup(@Body() data: CreateUserDto) {
    return this.authService.signup(data);
  }
}
