import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/auth.dto";

@Injectable()
export class AuthService {
  signup(data: CreateUserDto) {
    return data;
  }
}
