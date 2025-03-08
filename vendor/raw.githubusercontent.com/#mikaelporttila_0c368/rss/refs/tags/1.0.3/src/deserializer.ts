import type { Feed } from "./types/feed.ts";
import type { ResolverResult } from "./resolvers/types/resolver_result.ts";
import { SAXParser } from "../deps.ts";
import { FeedParseType } from "./types/feed_type.ts";
import { FeedType } from "./types/feed_type.ts";

import { isAtomCDataField } from "./resolvers/atom_resolver.ts";
import { resolveAtomField } from "./resolvers/atom_resolver.ts";
import { resolveRss1Field } from "./resolvers/rss1_resolver.ts";
import { resolveRss2Field } from "./resolvers/rss2_resolver.ts";

import { toFeed } from "./mappers/mapper.ts";

/**
 * Parse Atom or RSS into a common Feed type
 * @param Atom or RSS XML string
 */
export async function parseFeed(input: string): Promise<Feed> {
  if (!input) {
    throw new Error("Input was undefined, null or empty");
  }

  const { data, feedType } = await parse(input);
  return toFeed(feedType, data)!;
}

export interface Options {
  outputJsonFeed?: boolean;
}

const parse = (input: string) =>
  new Promise<{ feedType: FeedType; data: any }>(
    (resolve, reject) => {
      if (!input) {
        reject(new Error("Input was undefined, null or empty"));
        return;
      }

      //	Handle invalid feed documents by converting the description field to CDATA.
      input = input
        .replaceAll(
          /<description>(?!(\s*<!\[CDATA))/g,
          `<description><![CDATA[`,
        )
        .replaceAll(/(?<!\]\]>\s*)<\/description>/g, `]]></description>`);

      let cDataLevel: number;
      let cDataBuilder: string;
      let cDataActive: boolean;
      let feedType: FeedType;

      let currentTag: OpenTag | undefined;
      const stack: any[] = [{}];
      const parser = new SAXParser(false, {
        trim: true,
        lowercase: true,
      });

      let resolveField: (
        nodeName: string,
      ) => ResolverResult;

      let isCDataField: (nodeName: string) => boolean;

      parser.oncdata = parser.ontext = (text: string): void => {
        if (cDataActive) {
          cDataBuilder += text;
        } else {
          stack[stack.length - 1].value = text.trim();
        }
      };

      const onOpenTag = (node: OpenTag): void => {
        currentTag = node;
        const attributeNames = Object.keys(node.attributes);

        if (cDataActive) {
          const attributes = attributeNames
            .map((key) => `${key}="${(node.attributes as any)[key]}"`)
            .join(" ")
            .trim();

          if (attributes.length) {
            cDataBuilder +=
              `<${node.name} ${attributes}${(node.isSelfClosing ? " /" : "")}>`;
          } else {
            cDataBuilder += `<${node.name}${(node.isSelfClosing ? " /" : "")}>`;
          }

          cDataLevel++;
          return;
        }

        if (isCDataField(node.name)) {
          cDataActive = true;
          cDataBuilder = "";
          cDataLevel = 0;
        }

        const newNode = attributeNames.reduce((builder, attrName) => {
          const val = (node.attributes as any)[attrName];
          if (val !== undefined && val !== null) {
            const { name, isInt, isFloat, isDate } = resolveField(attrName);

            if (isInt) {
              builder[name] = parseInt(val);
            } else if (isFloat) {
              builder[name] = parseFloat(val);
            } else if (isDate) {
              builder[name + "Raw"] = val;
              builder[name] = new Date(val);
            } else {
              builder[name] = val;
            }
          }

          return builder;
        }, {} as any);

        stack.push(newNode);
      };

      parser.onclosetag = (nodeName: string) => {
        const currentStartTag = currentTag;
        currentTag = undefined;
        if (cDataActive && cDataLevel) {
          if (!currentStartTag?.isSelfClosing) {
            cDataBuilder += `</${nodeName}>`;
          }

          cDataLevel--;
          return;
        }

        const node = stack.pop();

        if (stack.length === 0) {
          Object.assign(parser, {
            onopentag: undefined,
            onclosetag: undefined,
            ontext: undefined,
            oncdata: undefined,
          });

          const result = {
            feedType: feedType,
            data: node,
          };

          resolve(result);
          return;
        }

        const targetNode = stack[stack.length - 1];
        const {
          name,
          isArray,
          isInt,
          isFloat,
          isDate,
        } = resolveField(nodeName);

        if (cDataActive) {
          node.value = cDataBuilder;
          targetNode[name] = node;
          cDataBuilder = "";
          cDataActive = false;
          cDataLevel = 0;
          return;
        }

        if (node.value !== undefined && node.value !== null) {
          if (isInt) {
            node.value = parseInt(node.value);
          } else if (isFloat) {
            node.value = parseFloat(node.value);
          } else if (isDate) {
            targetNode[name + "Raw"] = { value: node.value };
            node.value = new Date(node.value);
          }
        }

        if (isArray) {
          if (!targetNode[name]) {
            targetNode[name] = [node];
          } else {
            targetNode[name].push(node);
          }
        } else {
          const isEmpty = (typeof node === "object") &&
            Object.keys(node).length === 0 &&
            !(node instanceof Date);
          try {
            if (!isEmpty) {
              targetNode[name] = node;
            }
          } catch {
            console.warn(
              `Failed to add property ${name} on node`,
              targetNode,
            );
          }
        }
      };

      parser.onopentag = (node: OpenTag) => {
        switch (node.name) {
          case FeedParseType.Atom:
            feedType = FeedType.Atom;
            isCDataField = isAtomCDataField;
            resolveField = resolveAtomField;
            break;
          case FeedParseType.Rss2:
            feedType = FeedType.Rss2;
            isCDataField = () => false;
            resolveField = resolveRss2Field;
            break;
          case FeedParseType.Rss1:
            feedType = FeedType.Rss1;
            isCDataField = () => false;
            resolveField = resolveRss1Field;
            break;
          default:
            reject(new Error(`Type ${node.name} is not supported`));
            break;
        }
        parser.onopentag = onOpenTag;
      };

      parser.onend = () => {
        if (!feedType) {
          Object.assign(parser, {
            onopentag: undefined,
            onclosetag: undefined,
            ontext: undefined,
            oncdata: undefined,
            onend: undefined,
          });

          reject(new Error(`Invalid or unsupported feed format`));
        }
      };

      parser
        .write(input)
        .close()
        .flush();
    },
  );

interface OpenTag {
  name: string;
  attributes: {};
  isSelfClosing: boolean;
}
