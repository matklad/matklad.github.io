import type { ResolverResult } from "./types/resolver_result.ts";
import { MediaRssFields } from "../types/fields/media_rss_fields.ts";

export const resolveMediaRssField = (
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
    case MediaRssFields.Comment:
    case MediaRssFields.Response:
    case MediaRssFields.Scene:
    case MediaRssFields.Group:
    case MediaRssFields.Content:
      result.isArray = true;
      break;
    case MediaRssFields.PriceValue:
      result.isFloat = true;
      break;
    default:
      result.isHandled = false;
      break;
  }

  return result;
};
