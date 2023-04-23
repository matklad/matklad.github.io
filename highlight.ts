import { html, HtmlString } from "./templates.ts";

import hljs_ from "highlightjs/highlight.min.js";
const hljs: any = hljs_;
hljs.configure({ classPrefix: "hl-" });

import latex from "highlightjs/languages/latex.min.js";
import nix from "highlightjs/languages/nix.min.js";
import x86asm from "highlightjs/languages/x86asm.min.js";
import zig from "./highlightjs-zig.js";

hljs.registerLanguage("latex", latex);
hljs.registerLanguage("nix", nix);
hljs.registerLanguage("x86asm", x86asm);
hljs.registerLanguage("Zig", zig);

export function highlight(
  source: string,
  language?: string,
  highlight_spec?: string,
): HtmlString {
  const spec = parse_highlight_spec(highlight_spec);
  let src = source;
  let callouts: Map<number, number[]>;
  [src, callouts] = parse_callouts(src);
  let highlighted: string = add_spans(src, language).value;
  highlighted = highlighted.trimEnd();
  const openTags: string[] = [];
  highlighted = highlighted.replace(
    /(<span [^>]+>)|(<\/span>)|(\n)/g,
    (match) => {
      if (match === "\n") {
        return "</span>".repeat(openTags.length) + "\n" + openTags.join("");
      }

      if (match === "</span>") {
        openTags.pop();
      } else {
        openTags.push(match);
      }

      return match;
    },
  );
  const lines = highlighted.split("\n").map((it, idx) => {
    const cls = spec.includes(idx + 1) ? ' class="hl-line"' : "";
    const calls = (callouts.get(idx) ?? [])
      .map((it) => `<i class="callout" data-value="${it}"></i>`)
      .join(" ");
    return `<code${cls}>${it}${calls}</code>`;
  })
    .join("\n");
  return html`\n<pre>${new HtmlString(lines)}</pre>\n`;
}

function add_spans(source: string, language?: string): HtmlString {
  if (!language || language === "adoc") return html`${source}`;
  if (language == "console") return add_spans_console(source);
  const res = hljs.highlight(source, { language, ignoreIllegals: true });
  return new HtmlString(res.value);
}

function add_spans_console(source: string): HtmlString {
  let cont = false;
  const lines = source.trimEnd().split("\n").map((line) => {
    if (cont) {
      cont = line.endsWith("\\");
      return html`${line}\n`;
    }
    if (line.startsWith("$ ")) {
      cont = line.endsWith("\\");
      return html`<span class="hl-title function_">$</span> ${
        line.substring(2)
      }\n`;
    }
    if (line.startsWith("#")) {
      return html`<span class="hl-comment">${line}</span>\n`;
    }
    return html`<span class="hl-output">${line}</span>\n`;
  });
  return html`${lines}`;
}

function parse_highlight_spec(spec?: string): number[] {
  if (!spec) return [];
  return spec.split(",").flatMap((el) => {
    if (el.includes("-")) {
      const [los, his] = el.split("-");
      const lo = parseInt(los, 10);
      const hi = parseInt(his, 10);
      return Array.from({ length: (hi - lo) + 1 }, (x, i) => lo + i);
    }
    return [parseInt(el, 10)];
  });
}

function parse_callouts(source: string): [string, Map<number, number[]>] {
  const res: Map<number, number[]> = new Map();
  let line = 0;
  const without_callouts = source.replace(/<(\d)>|\n/g, (m, d) => {
    if (m === "\n") {
      line += 1;
      return m;
    }
    const arr = res.get(line) ?? [];
    arr.push(d);
    res.set(line, arr);
    return "";
  });
  return [without_callouts, res];
}
