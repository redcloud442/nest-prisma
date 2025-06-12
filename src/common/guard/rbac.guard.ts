import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { User } from "@supabase/supabase-js";

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      "roles",
      context.getHandler()
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No RBAC restriction
    }

    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    const userRoles = user?.user_metadata?.Role;

    const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];

    const hasRole = rolesArray.some((role) =>
      requiredRoles.includes(role?.toUpperCase())
    );

    if (!hasRole) {
      throw new UnauthorizedException("User does not have the required role");
    }

    return true;
  }
}
