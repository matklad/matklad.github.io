import * as async from "https://deno.land/std@0.161.0/async/mod.ts";
import * as fs from "https://deno.land/std@0.161.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.161.0/path/mod.ts";
import * as streams from "https://deno.land/std@0.161.0/streams/mod.ts";
import * as mod from "https://deno.land/std@0.163.0/uuid/mod.ts";

export const std = {
  async,
  fs,
  path,
  streams,
};

import hljs_ from "https://unpkg.com/@highlightjs/cdn-assets@11.6.0/es/highlight.min.js";
import latex from "https://unpkg.com/@highlightjs/cdn-assets@11.6.0/es/languages/latex.min.js";
import nix from "https://unpkg.com/@highlightjs/cdn-assets@11.6.0/es/languages/nix.min.js";
import x86asm from "https://unpkg.com/@highlightjs/cdn-assets@11.6.0/es/languages/x86asm.min.js";
let hljs: any = hljs_
hljs.configure({ classPrefix: "hl-" });
hljs.registerLanguage("latex", latex);
hljs.registerLanguage("nix", nix);
hljs.registerLanguage("x86asm", x86asm);

export { hljs };
