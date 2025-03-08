import type { ResolverResult } from "./types/resolver_result.ts";
import { Rss2Fields } from "../types/fields/rss2_fields.ts";
import { resolveDublinCoreField } from "./dublin_core_resolver.ts";
import { resolveMediaRssField } from "./media_rss_resolver.ts";

export const resolveRss2Field = (
  name: string,
): ResolverResult => {
  let result = {
    name,
    isHandled: true,
    isArray: false,
    isInt: false,
    isFloat: false,
    isDate: false,
  } as ResolverResult;

  switch (name) {
    case Rss2Fields.TextInput:
      result.name = "textInput";
      break;
    case Rss2Fields.SkipHours:
      result.name = "skipHours";
      break;
    case Rss2Fields.SkipDays:
      result.name = "skipDays";
      break;
    case Rss2Fields.PubDate:
      result.name = "pubDate";
      result.isDate = true;
      break;
    case Rss2Fields.ManagingEditor:
      result.name = "managingEditor";
      break;
    case Rss2Fields.WebMaster:
      result.name = "webMaster";
      break;
    case Rss2Fields.LastBuildDate:
      result.name = "lastBuildDate";
      result.isDate = true;
      break;
    case Rss2Fields.Item:
      result.name = "items";
      result.isArray = true;
      break;
    case Rss2Fields.Enclosure:
      result.isArray = true;
      break;
    case Rss2Fields.Category:
      result.name = "categories";
      result.isArray = true;
      break;
    case Rss2Fields.isPermaLink:
      result.name = "isPermaLink";
      break;
    case Rss2Fields.Ttl:
    case Rss2Fields.Length:
    case Rss2Fields.Width:
    case Rss2Fields.Height:
      result.isInt = true;
      break;
    case Rss2Fields.Hour:
      result.isArray = true;
      result.isInt = true;
      break;
    case Rss2Fields.Day:
      result.isArray = true;
      break;
    default:
      const subNamespaceResolvers = [
        resolveDublinCoreField,
        resolveMediaRssField,
      ];
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
