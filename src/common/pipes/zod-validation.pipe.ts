// pipes/zod-validation.pipe.ts
import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { ZodSchema } from "zod";
import { ContextService } from "../context/context.service";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly contextService: ContextService) {}

  private schema: ZodSchema<any>;

  setSchema(schema: ZodSchema<any>) {
    this.schema = schema;
  }

  transform(value: unknown) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException(result.error.flatten());
    }

    return result.data;
  }
}
