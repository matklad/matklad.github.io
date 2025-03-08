import { AtomFields } from "../types/fields/atom_fields.ts";
import { resolveDublinCoreField } from "./dublin_core_resolver.ts";
import type { ResolverResult } from "./types/resolver_result.ts";

export const resolveAtomField = (
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
    case AtomFields.Category:
      result.name = "categories";
      result.isArray = true;
      break;
    case AtomFields.Contributor:
      result.name = "contributors";
      result.isArray = true;
      break;
    case AtomFields.Link:
      result.name = "links";
      result.isArray = true;
      break;
    case AtomFields.Entry:
      result.name = "entries";
      result.isArray = true;
      break;
    case AtomFields.Updated:
    case AtomFields.Published:
      result.isDate = true;
      break;
    default:
      const resolverResult = resolveDublinCoreField(name);
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
      }
      break;
  }

  return result;
};

export const isAtomCDataField = (nodeName: string): boolean => {
  switch (nodeName) {
    case AtomFields.Title:
    case AtomFields.Summary:
    case AtomFields.Content:
    case AtomFields.Rights:
      return true;
  }

  return false;
};
