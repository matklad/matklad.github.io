import type { ResolverResult } from "./types/resolver_result.ts";
import { SlashFields } from "../types/fields/slash_fields.ts";

export const resolveSlashField = (
  name: string,
): ResolverResult => {
  const result = {
    name,
    isHandled: true,
    isArray: false,
    isInt: false,
    isFloat: false,
    isDate: false,
  } as ResolverResult;

  switch (name) {
    case SlashFields.Comments:
      result.isInt = true;
      break;
    default:
      result.isHandled = false;
      break;
  }

  return result;
};
