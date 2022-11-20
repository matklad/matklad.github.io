// deno-lint-ignore-file no-explicit-any
import { std } from "./deps.ts";
import { highlight } from "./highlight.ts";
import { html, HtmlString, time } from "./templates.ts";

export async function parse(source: string): Promise<Node> {
  const proc = Deno.run({
    cmd: ["lua", "bin/main.lua", "-a", "-j"],
    cwd: "./djot",
    stdin: "piped",
    stdout: "piped",
  });
  const writer = async () => {
    await std.streams.writeAll(proc.stdin, new TextEncoder().encode(source));
    proc.stdin.close();
  };
  const reader = std.streams.readAll(proc.stdout);
  const [_, bytes] = await Promise.all([writer(), reader]);
  await proc.status();
  const text = new TextDecoder().decode(bytes);
  const ast = JSON.parse(text);
  return Node.new_root(ast);
}

export function render(node: Node, ctx: any): HtmlString {
  try {
    return node.withContext(ctx).render();
  } catch (e) {
    return html`Error: ${e}`;
  }
}

const visitor: { [key: string]: (node: Node) => HtmlString } = {
  doc: (node) => node.content,
  section: (node) => {
    if (node.child("heading")?.ast?.level == 1) {
      return node.content;
    }
    return html`<section>${node.content}</section>`;
  },
  heading: (node) => {
    const tag = `h${node.ast.level}`;
    const date = node.ast.level == 1 && node.ctx.date
      ? time(node.ctx.date)
      : undefined;
    const res = html`\n<${tag}>${node.content} ${date}</${tag}>\n`;
    return res;
  },
  list: (node) => {
    const list_style = node.ast.list_style;
    let tag = "ol";
    if ("-+*".includes(list_style)) tag = "ul";
    if (list_style === ":") tag = "dl";
    let type = "";
    if (list_style === "a.") type = ' type="a"';
    if (list_style === "i.") type = ' type="i"';
    const cls = list_style === "1)"
      ? node.class_attr_extra("callout")
      : node.class_attr;
    return html`\n<${tag} ${cls}${type}>${node.content}</${tag}>\n`;
  },
  list_item: (node) => html`  <li>${node.content}</li>\n`,
  definition_list_item: (node) => node.content,
  term: (node) => html`  <dt>${node.content}</dt>\n`,
  definition: (node) => html`  <dd>${node.content}</dd>\n`,
  para: (node) => {
    // if (node.parent?.tag === "list_item" && node.parent?.parent?.ast?.tight) {
    //   return node.content;
    // }
    if (!node.ctx.summary) node.ctx.summary = node.content;
    if (node.children.length == 1 && node.children[0].tag == "image") {
      const cap = node.ast.attr?.cap
        ? html`<figcaption class="title">${node.ast.attr.cap}</figcaption>\n`
        : "\n";

      return html`\n<figure${node.class_attr}>${cap}${node.content}</figure>\n`;
    }
    return html`\n<p${node.class_attr}>${node.content}</p>\n`;
  },
  blockquote: (node) => {
    const children = [...node.children];
    let source = undefined;
    if (children.length > 0) {
      const last_child = children[children.length - 1];
      if (
        last_child.children.length == 1 && last_child.children[0].tag == "link"
      ) {
        source = last_child.children[0];
        children.pop();
      }
    }
    const cite = source
      ? html`<figcaption><cite>${source.render()}</cite></figcaption>`
      : "";

    return html`
<figure class="blockquote">
<blockquote>${children.map((it) => it.render())}</blockquote>
${cite}
</figure>\n`;
  },
  div: (node) => {
    let admon_icon = "";
    if (node.cls.includes("note")) admon_icon = "info-circle";
    if (node.cls.includes("quiz")) admon_icon = "question-circle";
    if (node.cls.includes("warn")) admon_icon = "exclamation-circle";
    if (admon_icon) {
      return html`
<aside class="admn">
  <i class="fa fa-${admon_icon}"></i>
  <div>${node.content}</div>
</aside>`;
    }

    if (node.cls.includes("block")) {
      const cap = node.ast.attr?.cap
        ? html`<div class="title">${node.ast.attr.cap}</div>\n`
        : "\n";
      return html`
<aside class="block">
${cap}
${node.content}
</aside>
`;
    }

    if (node.cls.includes("details")) {
      return html`
<details>
<summary>${node.ast.attr?.cap}</summary>
${node.content}
</details>
`;
    }

    return html`<div${node.class_attr}>${node.content}</div>`;
  },
  code_block: (node) => {
    const cap = node.ast.attr?.cap
      ? html`<figcaption class="title">${node.ast.attr.cap}</figcaption>\n`
      : "\n";
    const pre = highlight(node.text, node.ast.lang, node.ast.attr?.highlight);
    return html`
<figure class="code-block">
${cap}${pre}
</figure>`;
  },
  raw_block: (node) => {
    if (node.ast.format == "html") return new HtmlString(node.text);
    return html``;
  },
  table: (node) => html`<table>${node.content}</table>`,
  row: (node) => html`<tr>${node.content}</tr>`,
  cell: (node) => html`<td>${node.content}</td>`,
  verbatim: (node) => html`<code>${node.text}</code>`,
  link: (node) => {
    const href = node.ast.reference
      ? node.references[node.ast.reference].destination
      : node.ast.destination;
    return html`<a href="${href}">${node.content}</a>`;
  },
  image: (node) => {
    const href = node.ast.reference
      ? node.references[node.ast.reference].destination
      : node.ast.destination;
    if (node.cls.includes("video")) {
      return html`<video src="${href}" controls=""></video>`;
    } else {
      return html`<img src="${href}" alt="${node.text}">`;
    }
  },
  reference_definition: (_node) => html``,
  url: (node) =>
    html`<a class="url" href="${node.ast.destination}">${node.ast.destination}</a>`,
  double_quoted: (node) => html`“${node.content}”`,
  single_quoted: (node) => html`‘${node.content}’`,
  span: (node) => {
    if (node.cls.includes("kbd")) {
      let first = true;
      const keystrokes = node.text.split("+")
        .map((it) => {
          const plus = first ? "" : "+";
          first = false;
          return html`${plus}<kbd>${it}</kbd>`;
        });
      return html`${keystrokes}`;
    }
    if (node.cls.includes("menu")) {
      const content = new HtmlString(html`${node.content}`.value.replaceAll(
        "&gt;",
        '<i class="fa fa-angle-right"></i>',
      ));
      return html`<span class="menu">${content}</span>`;
    }
    throw `unhandled node: ${JSON.stringify(node.ast)}`;
  },
  emph: (node) => html`<em>${node.content}</em>`,
  strong: (node) => html`<strong>${node.content}</strong>`,
  superscript: (node) => html`<sup>${node.content}</sup>`,
  delete: (node) => html`<del>${node.content}</del>`,
  thematic_break: (_node) => html`<hr />`,
  str: (node) => html`${node.text}`,
  nbsp: (_node) => new HtmlString("&nbsp;"),
  hardbreak: (_node) => html`<br>\n`,
};

const substs: Record<string, string> = {
  ellipses: "…",
  left_single_quote: "‘",
  right_single_quote: "’",
  left_double_quote: "“",
  right_double_quote: "”",
  en_dash: "–",
  em_dash: "—",
  softbreak: "\n",
};

export class Node {
  private constructor(
    public ast: any,
    public parent: Node | undefined,
    public ctx: any,
  ) {}

  public static new_root(ast: any): Node {
    return new Node(ast, undefined, undefined);
  }

  public withContext(ctx: any): Node {
    if (this.parent) throw "not a root";
    return new Node(this.ast, undefined, ctx);
  }

  public get tag(): string {
    return this.ast.tag;
  }

  public get children(): Node[] {
    return this.ast.children?.map((it: any) => new Node(it, this, this.ctx)) ??
      [];
  }

  public get text(): string {
    const s = this.ast.text;
    if (s !== undefined) return s;
    return this.child("str")?.text ?? "";
  }

  public get cls(): string {
    const attrs = (this.ast.attr ?? {});
    return attrs["class"] ?? "";
  }

  public get class_attr(): HtmlString {
    return this.class_attr_extra();
  }

  public class_attr_extra(exra = ""): HtmlString {
    let cls = this.cls ?? "";
    if (exra) cls += ` ${exra}`;
    if (!cls.trim()) return new HtmlString("");
    return html` class = "${cls}"`;
  }

  get content(): HtmlString {
    return html`${this.children.map((it) => it.render())}`;
  }
  get references(): Record<string, { destination: string }> {
    if (this.parent) return this.parent.references;
    return this.ast.references;
  }

  public child(t: string): Node | undefined {
    return this.children.find((it) => it.tag == t);
  }

  render(): HtmlString {
    try {
      const subst = substs[this.tag];
      if (subst) return html`${subst}`;
      const f = visitor[this.tag];
      if (!f) throw `unhandled node ${this.tag}`;
      return f(this);
    } catch (e) {
      console.error(e);
      return html`<strong>${e}</strong>:<br>can't render ${
        JSON.stringify(this.ast)
      }<br/>${e.stack}`;
    }
  }
}
