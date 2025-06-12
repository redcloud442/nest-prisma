// context/context.service.ts
import { Injectable, Scope } from "@nestjs/common";

@Injectable({ scope: Scope.REQUEST })
export class ContextService {
  private data = new Map<string, any>();

  set(key: string, value: any) {
    this.data.set(key, value);
  }

  get<T = any>(key: string): T | undefined {
    return this.data.get(key);
  }
}
