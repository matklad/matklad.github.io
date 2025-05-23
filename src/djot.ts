import { highlight } from "./highlight.ts";
import { HtmlString, time_html } from "./templates.tsx";

import { parse as djot_parse } from "@djot/parse.ts";
import { HTMLRenderer, renderHTML } from "@djot/html.ts";
import {
  AstNode,
  BlockQuote,
  CodeBlock,
  Div,
  Doc,
  HasAttributes,
  Heading,
  Image,
  OrderedList,
  Para,
  Section,
  Span,
  Str,
  Url,
  Visitor,
} from "@djot/ast.ts";

export function parse(source: string): Doc {
  return djot_parse(source);
}

type RenderCtx = {
  date?: Date;
  summary?: string;
  title?: string;
};

export function render(doc: Doc, ctx: RenderCtx): HtmlString {
  let section: Section | undefined = undefined;
  const overrides: Visitor<HTMLRenderer, string> = {
    section: (node: Section, r: HTMLRenderer): string => {
      const section_prev = section;
      section = node;
      const result = get_child(node, "heading")?.level == 1
        ? r.renderChildren(node)
        : r.renderAstNodeDefault(node);
      section = section_prev;
      return result;
    },
    heading: (node: Heading, r: HTMLRenderer) => {
      const tag = `h${node.level}`;
      const date = node.level == 1 && ctx.date
        ? time_html(ctx.date, "meta")
        : "";
      const children = r.renderChildren(node);
      if (node.level == 1) ctx.title = get_string_content(node);
      const id = node.level > 1 && section?.autoAttributes?.id;
      if (id) {
        return `
    <${tag}${r.renderAttributes(node)}>
    <a href="#${id}">${children} ${date}</a>
    </${tag}>\n`;
      } else {
        return `\n<${tag}${
          r.renderAttributes(node)
        }>${children} ${date}</${tag}>\n`;
      }
    },
    ordered_list: (node: OrderedList, r: HTMLRenderer): string => {
      if (node.style === "1)") add_class(node, "callout");
      return r.renderAstNodeDefault(node);
    },
    para: (node: Para, r: HTMLRenderer) => {
      if (node.children.length == 1 && node.children[0].tag == "image") {
        let cap = extract_cap(node);
        if (cap) {
          cap = `<figcaption class="title">${cap}</figcaption>\n`;
        } else {
          cap = "";
        }

        return `
<figure${r.renderAttributes(node)}>
${cap}
${r.renderChildren(node)}
</figure>
`;
      }
      const result = r.renderAstNodeDefault(node);
      if (!ctx.summary) ctx.summary = get_string_content(node);
      return result;
    },
    block_quote: (node: BlockQuote, r: HTMLRenderer) => {
      let source = undefined;
      if (node.children.length > 0) {
        const last_child: { tag: string; children?: AstNode[] } =
          node.children[node.children.length - 1];
        if (
          last_child.tag != "thematic_break" &&
          last_child?.children?.length == 1 &&
          last_child?.children[0].tag == "link"
        ) {
          source = last_child.children[0];
          node.children.pop();
        }
      }
      const cite = source
        ? `<figcaption><cite>${r.renderAstNode(source)}</cite></figcaption>`
        : "";

      return `
<figure class="blockquote">
<blockquote>${r.renderChildren(node)}</blockquote>
${cite}
</figure>
`;
    },
    div: (node: Div, r: HTMLRenderer): string => {
      let admon_icon = "";
      if (has_class(node, "note")) admon_icon = "info";
      if (has_class(node, "quiz")) admon_icon = "question";
      if (has_class(node, "warn")) admon_icon = "exclamation";
      if (admon_icon) {
        return `
<aside${r.renderAttributes(node, { "class": "admn" })}>
<svg class="icon"><use href="/assets/icons.svg#${admon_icon}"/></svg>
<div>${r.renderChildren(node)}</div>
</aside>`;
      }

      if (has_class(node, "block")) {
        let cap = extract_cap(node);
        if (cap) {
          cap = `<div class="title">${cap}</div>`;
        } else {
          cap = "";
        }
        return `
<aside${r.renderAttributes(node)}>
${cap}
${r.renderChildren(node)}
</aside>
  `;
      }

      if (has_class(node, "details")) {
        return `
<details>
<summary>${extract_cap(node)}</summary>
${r.renderChildren(node)}
</details>
  `;
      }

      return r.renderAstNodeDefault(node);
    },
    code_block: (node: CodeBlock) => {
      let cap = extract_cap(node);
      if (cap) {
        cap = `<figcaption class="title">${cap}</figcaption>\n`;
      } else {
        cap = "";
      }

      const pre = highlight(
        node.text,
        node.lang,
        attr(node, "highlight"),
      ).value;
      return `
<figure class="code-block">
${cap}
${pre}
</figure>
`;
    },
    image: (node: Image, r: HTMLRenderer): string => {
      if (has_class(node, "video")) {
        if (!node.destination) throw "missing destination";
        if (has_class(node, "loop")) {
          return `<video src="${node.destination}" autoplay muted=true loop=true></video>`;
        } else {
          return `<video src="${node.destination}" controls muted=true></video>`;
        }
      }
      return r.renderAstNodeDefault(node);
    },
    span: (node: Span, r: HTMLRenderer) => {
      if (has_class(node, "code")) {
        const children = r.renderChildren(node);
        return `<code>${children}</code>`;
      }
      if (has_class(node, "dfn")) {
        const children = r.renderChildren(node);
        return `<dfn>${children}</dfn>`;
      }
      if (has_class(node, "kbd")) {
        const children = get_string_content(node)
          .split("+")
          .map((it) => `<kbd>${it}</kbd>`)
          .join("+");
        return `<kbd>${children}</kbd>`;
      }
      if (has_class(node, "menu")) {
        return r.renderAstNodeDefault(node).replaceAll(
          "&gt;",
          "›",
        );
      }
      return r.renderAstNodeDefault(node);
    },
    str: (node: Str, r: HTMLRenderer) => {
      if (has_class(node, "dfn")) {
        return `<dfn>${node.text}</dfn>`;
      }
      return r.renderAstNodeDefault(node);
    },
    url: (node: Url, r: HTMLRenderer) => {
      add_class(node, "url");
      return r.renderAstNodeDefault(node);
    },
  };

  const result = renderHTML(doc, { overrides });
  return new HtmlString(result);
}

type AstTag = AstNode["tag"];

function get_child<Tag extends AstTag>(
  node: AstNode,
  tag: Tag,
): Extract<AstNode, { tag: Tag }> | undefined {
  for (const child of (node as { children?: AstNode[] })?.children ?? []) {
    if (child.tag == tag) return child as Extract<AstNode, { tag: Tag }>;
  }
  return undefined;
}

function has_class(node: AstNode, cls: string): boolean {
  const classes = attr(node, "class") ?? "";
  return classes.split(" ").includes(cls);
}

function add_class(node: AstNode, cls: string) {
  const classes = attr(node, "class");
  setattr(node, "class", classes ? `${classes} ${cls}` : cls);
}

function extract_cap(node: AstNode): string | undefined {
  const cap = attr(node, "cap");
  if (cap) {
    delete node.attributes!.cap;
    return cap;
  }
}

function attr(node: HasAttributes, name: string): string | undefined {
  return node.attributes ? node.attributes[name] : undefined;
}

function setattr(node: HasAttributes, name: string, value: string) {
  node.attributes = node.attributes || {};
  node.attributes[name] = value;
}

const get_string_content = function (node: AstNode): string {
  const buffer: string[] = [];
  add_string_content(node, buffer);
  return buffer.join("");
};

const add_string_content = function (
  node: AstNode,
  buffer: string[],
): void {
  if ("text" in node) {
    buffer.push(node.text);
  } else if (
    "tag" in node &&
    (node.tag === "soft_break" || node.tag === "hard_break")
  ) {
    buffer.push("\n");
  } else if ("children" in node) {
    for (const child of node.children) {
      add_string_content(child, buffer);
    }
  }
};
