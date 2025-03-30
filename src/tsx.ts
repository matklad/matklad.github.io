// deno-lint-ignore-file ban-types no-explicit-any
export type VNode = string | number | boolean | null | undefined | {
  tag: string | Function;
  props: Record<string, any>;
  children: VNode[];
};

// deno-fmt-ignore
const selfClosingTags = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr", "use",
]);

export function h(
  tag: string | Function,
  props: Record<string, any> | null,
  ...children: VNode[]
): VNode {
  return typeof tag === "function"
    ? tag({ ...props, children })
    : { tag, props: props || {}, children };
}

export const Fragment = (props: { children: VNode[] }) => props.children;

export function Raw({ unsafe }: { unsafe: string }): VNode {
  return {
    tag: "raw",
    props: { unsafe },
    children: [],
  };
}

export function render(vnode: VNode): string {
  if (vnode == null || typeof vnode === "boolean") return "";
  if (typeof vnode === "string" || typeof vnode === "number") {
    return escapeHtml(String(vnode));
  }
  if (Array.isArray(vnode)) return vnode.map(render).join("");

  const { tag, props, children } = vnode;
  if (tag == "raw") return props.unsafe;
  if (typeof tag === "function") return render(tag({ ...props, children }));

  const attrs = Object.entries(props)
    .map(([key, value]) =>
      value === true
        ? key
        : (value === false || value === undefined)
        ? ""
        : `${key}="${escapeHtml(String(value))}"`
    )
    .filter(Boolean)
    .join(" ");

  if (selfClosingTags.has(tag)) {
    return `<${tag}${attrs ? " " + attrs : ""} />`;
  }

  const renderedChildren = children.map(render).join("");
  return `<${tag}${attrs ? " " + attrs : ""}>${renderedChildren}</${tag}>`;
}

declare global {
  namespace JSX {
    // deno-fmt-ignore
    interface IntrinsicElements {
      div: any; span: any; p: any; a: any; h1: any; h2: any; h3: any; h4: any; h5: any; h6: any;
      img: any; button: any; input: any; form: any; label: any; ul: any; ol: any; li: any;
      table: any; tr: any; td: any; th: any; thead: any; tbody: any; tfoot: any; strong: any;
      em: any; b: any; i: any; u: any; code: any; pre: any; blockquote: any; hr: any; br: any;
      section: any; article: any; aside: any; nav: any; header: any; footer: any; main: any;
      video: any; audio: any; source: any; canvas: any; svg: any; path: any; circle: any; rect: any;
      polyline: any; polygon: any; line: any; text: any; g: any;
      [elemName: string]: any;
    }
    type Element = VNode;
  }
}

export function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
