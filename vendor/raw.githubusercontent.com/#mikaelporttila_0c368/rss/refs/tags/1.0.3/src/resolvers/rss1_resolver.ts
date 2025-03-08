import type { ResolverResult } from "./types/resolver_result.ts";
import { Rss1Fields } from "../types/fields/rss1_fields.ts";
import { resolveDublinCoreField } from "./dublin_core_resolver.ts";
import { resolveSlashField } from "./slash_resolver.ts";

export const resolveRss1Field = (
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
    case Rss1Fields.TextInput:
      result.name = "textInput";
      break;
    case Rss1Fields.Item:
      result.isArray = true;
      break;
    case Rss1Fields.About:
      result.name = "about";
      break;
    case Rss1Fields.Resource:
      result.name = "resource";
      break;
    default:
      const subNamespaceResolvers = [resolveDublinCoreField, resolveSlashField];
      for (let i = 0; i < subNamespaceResolvers.length; i++) {
        const resolverResult = subNamespaceResolvers[i](name);
        if (resolverResult.isHandled) {
          if (resolverResult.isArray) {
            result.isArray = true;
          }

          if (resolverResult.isDate) {
            result.isDate = true;
          }

          if (resolverResult.isInt) {
            result.isInt = true;
          }

          if (resolverResult.isFloat) {
            result.isFloat = true;
          }

          result.name = resolverResult.name;
          break;
        }
      }
      break;
  }

  return result;
};
