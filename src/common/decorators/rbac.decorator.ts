// src/common/guards/rbac.guard.ts
import { SetMetadata } from "@nestjs/common";

export const Rbac = (roles: string[]) => SetMetadata("roles", roles);
