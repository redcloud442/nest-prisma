import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { SupabaseAuthStrategy } from "nestjs-supabase-auth";
import { ExtractJwt } from "passport-jwt";

@Injectable()
export class SupabaseStrategy extends PassportStrategy(
  SupabaseAuthStrategy,
  "supabase"
) {
  public constructor(private readonly configService: ConfigService) {
    super({
      supabaseUrl: configService.get<string>("SUPABASE_URL"),
      supabaseKey: configService.get<string>("SUPABASE_ANON_KEY"),
      supabaseOptions: {},
      supabaseJwtSecret: configService.get<string>("SUPABASE_JWT_SECRET"),
      extractor: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: any): Promise<any> {
    return super.validate(payload);
  }

  authenticate(req) {
    super.authenticate(req);
  }
}
