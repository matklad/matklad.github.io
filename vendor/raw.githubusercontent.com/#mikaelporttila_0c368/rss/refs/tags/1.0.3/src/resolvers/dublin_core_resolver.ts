import type { ResolverResult } from "./types/resolver_result.ts";
import { DublinCoreFields } from "../types/fields/dublin_core_fields.ts";

export const resolveDublinCoreField = (
  name: string,
): ResolverResult => {
  const result = {
    name,
    isHandled: true,
  } as ResolverResult;

  switch (name) {
    case DublinCoreFields.Date:
    case DublinCoreFields.Created:
    case DublinCoreFields.DateSubmitted:
    case DublinCoreFields.Copyrighted:
    case DublinCoreFields.DateAccepted:
      result.isDate = true;
      break;
    case DublinCoreFields.Valid:
      result.isDate = true;
      result.isArray = true;
      break;
    case DublinCoreFields.Contributor:
    case DublinCoreFields.Creator:
      result.isArray = true;
      break;
    default:
      result.isHandled = false;
      break;
  }

  return result;
};
